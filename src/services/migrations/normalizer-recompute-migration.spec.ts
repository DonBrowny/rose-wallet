import * as schema from '@/db/schema'
import {
  PATTERN_STATUS,
  patterns,
  patternSmsGroup,
  smsMessages,
  TRANSACTION_TYPE,
  type NewPattern,
  type NewSmsMessage,
} from '@/db/schema'
import type { ReviewTxn } from '@/types/sms-parsing'
import { murmurHash32 } from '@/utils/hash/murmur32'
import {
  deletePatternSamplesByName,
  getPatternSamplesByName,
  setPatternSamplesByName,
} from '@/utils/mmkv/pattern-samples'
import { NORMALIZER_VERSION, normalizeSMSTemplate } from '@/utils/pattern/normalize-sms-template'
import { createClient } from '@libsql/client/node'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { recomputeStaleGroupingPatterns } from './normalizer-recompute-migration'

jest.mock('@/utils/mmkv/pattern-samples', () => ({
  getPatternSamplesByName: jest.fn(),
  setPatternSamplesByName: jest.fn(),
  deletePatternSamplesByName: jest.fn(),
}))

const mockGetSamples = getPatternSamplesByName as jest.Mock
const mockSetSamples = setPatternSamplesByName as jest.Mock
const mockDeleteSamples = deletePatternSamplesByName as jest.Mock

// Real SMS bodies, re-normalized by the CURRENT normalizer — never hand-computed, so
// the test can't drift from what normalizeSMSTemplate actually produces.
const CURRENT_BODIES = [
  'Rs.100 debited from a/c XX1234 for amazon',
  'Rs.250 debited from a/c XX5678 for amazon',
  'Rs.999 debited from a/c XX9999 for amazon',
]
const CURRENT_TEMPLATE = normalizeSMSTemplate(CURRENT_BODIES[0])
const CURRENT_NAME = murmurHash32(CURRENT_TEMPLATE)

function makeSample(overrides: Partial<ReviewTxn> = {}): ReviewTxn {
  return {
    smsId: 1,
    amount: 100,
    type: TRANSACTION_TYPE.Debit,
    merchantRaw: 'amazon',
    date: Date.now(),
    sender: 'VM-TESTBK',
    body: CURRENT_BODIES[0],
    ...overrides,
  }
}

// A bare `:memory:` URL is not usable here: @libsql/client's local driver opens a
// separate connection for db.transaction(), and an anonymous `:memory:` database is
// private per-connection, so the schema "disappears" (verified directly against
// @libsql/client, outside Jest/Drizzle — every table lookup after a transaction fails
// with "no such table"). A real temp file is shared across connections like production
// SQLite is, so it doesn't hit this.
function tempDbPath(): string {
  return path.join(os.tmpdir(), `rose-wallet-test-${process.pid}-${Math.random().toString(36).slice(2)}.db`)
}

function removeDbFile(file: string) {
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    fs.rmSync(`${file}${suffix}`, { force: true })
  }
}

async function createTestDb(file: string) {
  const client = createClient({ url: `file:${file}` })
  const drizzleDir = path.join(__dirname, '../../drizzle')
  const files = fs
    .readdirSync(drizzleDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
  for (const migrationFile of files) {
    await client.executeMultiple(fs.readFileSync(path.join(drizzleDir, migrationFile), 'utf-8'))
  }
  return { client, db: drizzle(client, { schema }) }
}

describe('recomputeStaleGroupingPatterns', () => {
  let client: Awaited<ReturnType<typeof createTestDb>>['client']
  let db: Awaited<ReturnType<typeof createTestDb>>['db']
  let dbFile: string
  let sampleStore: Record<string, ReviewTxn[]>

  beforeEach(async () => {
    jest.clearAllMocks()
    sampleStore = {}
    mockGetSamples.mockImplementation((name: string) => sampleStore[name] ?? [])
    mockSetSamples.mockImplementation((name: string, samples: ReviewTxn[]) => {
      sampleStore[name] = samples
    })
    mockDeleteSamples.mockImplementation((name: string) => {
      delete sampleStore[name]
    })

    dbFile = tempDbPath()
    const created = await createTestDb(dbFile)
    client = created.client
    db = created.db
  })

  afterEach(() => {
    client.close()
    removeDbFile(dbFile)
  })

  async function insertPattern(overrides: Partial<NewPattern> = {}) {
    const base: NewPattern = {
      name: 'legacy-name',
      groupingPattern: '<CUR><AMT>00.00 legacy template',
      extractionPattern: 'template',
      normalizerVersion: 1,
      type: TRANSACTION_TYPE.Debit,
      status: PATTERN_STATUS.NeedsReview,
      isActive: true,
      usageCount: 0,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      ...overrides,
    }
    const [row] = await db.insert(patterns).values(base).returning()
    return row
  }

  async function insertSms(overrides: Partial<NewSmsMessage> = {}) {
    const base: NewSmsMessage = {
      sender: 'VM-TESTBK',
      body: 'test sms body',
      dateTime: new Date('2026-01-01T00:00:00Z'),
      ...overrides,
    }
    const [row] = await db.insert(smsMessages).values(base).returning()
    return row
  }

  async function insertLink(patternId: number, smsId: number) {
    const [row] = await db.insert(patternSmsGroup).values({ patternId, smsId, confidence: 1 }).returning()
    return row
  }

  async function allRows() {
    return db.select().from(patterns)
  }

  async function linksFor(patternId: number) {
    return db.select().from(patternSmsGroup).where(eq(patternSmsGroup.patternId, patternId))
  }

  it('renames a stale row with samples, restamps it, and re-keys MMKV', async () => {
    const row = await insertPattern({
      name: 'legacy-name-rename',
      groupingPattern: '<CUR><AMT>00.00 legacy from a/c <NUM> amazon',
      status: PATTERN_STATUS.Approved,
    })
    sampleStore['legacy-name-rename'] = CURRENT_BODIES.map((body) => makeSample({ body }))

    const summary = await recomputeStaleGroupingPatterns(db)

    expect(summary).toEqual({ renamed: 1, merged: 0, deleted: 0, stampedOnly: 0 })

    const [updated] = await db.select().from(patterns).where(eq(patterns.id, row.id))
    expect(updated.name).toBe(CURRENT_NAME)
    expect(updated.groupingPattern).toBe(CURRENT_TEMPLATE)
    expect(updated.normalizerVersion).toBe(NORMALIZER_VERSION)

    expect(sampleStore['legacy-name-rename']).toBeUndefined()
    expect(sampleStore[CURRENT_NAME]).toHaveLength(3)
  })

  it('merges two stale rows whose samples now normalize identically', async () => {
    const rowA = await insertPattern({
      name: 'legacy-a',
      groupingPattern: '<CUR><AMT>00.00 legacy a',
      status: PATTERN_STATUS.Approved,
      usageCount: 5,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-10T00:00:00Z'),
    })
    const rowB = await insertPattern({
      name: 'legacy-b',
      groupingPattern: '<CUR> <AMT> legacy b variant',
      status: PATTERN_STATUS.Rejected,
      usageCount: 2,
      createdAt: new Date('2026-01-05T00:00:00Z'),
      updatedAt: new Date('2026-01-20T00:00:00Z'), // later than A — B's status should win
    })
    const sms201 = await insertSms()
    const sms202 = await insertSms()
    const sms203 = await insertSms() // shared by both patterns' links below — must dedupe after repoint

    sampleStore['legacy-a'] = [
      makeSample({ body: CURRENT_BODIES[0], smsId: sms201.id }),
      makeSample({ body: CURRENT_BODIES[1], smsId: sms203.id }),
    ]
    sampleStore['legacy-b'] = [
      makeSample({ body: CURRENT_BODIES[2], smsId: sms202.id }),
      makeSample({ body: CURRENT_BODIES[0], smsId: sms203.id }),
    ]

    await insertLink(rowA.id, sms201.id)
    await insertLink(rowA.id, sms203.id)
    await insertLink(rowB.id, sms202.id)
    await insertLink(rowB.id, sms203.id)

    const summary = await recomputeStaleGroupingPatterns(db)

    // rowA is processed first and claims the converged name via a rename (neither row
    // started out named that); rowB then collides into it and merges.
    expect(summary).toEqual({ renamed: 1, merged: 1, deleted: 0, stampedOnly: 0 })

    const rows = await allRows()
    expect(rows).toHaveLength(1)
    const survivor = rows[0]
    expect(survivor.name).toBe(CURRENT_NAME)
    expect(survivor.status).toBe(PATTERN_STATUS.Rejected) // B's status — B.updatedAt is later
    expect(survivor.usageCount).toBe(7) // 5 + 2
    expect(survivor.createdAt.getTime()).toBe(new Date('2026-01-01T00:00:00Z').getTime()) // earliest of the two
    expect(survivor.normalizerVersion).toBe(NORMALIZER_VERSION)

    expect(sampleStore['legacy-a']).toBeUndefined()
    expect(sampleStore['legacy-b']).toBeUndefined()
    expect(sampleStore[CURRENT_NAME]).toHaveLength(3) // 4 unioned, capped at SAMPLES_PER_PATTERN

    const links = await linksFor(survivor.id)
    const smsIds = links.map((l) => l.smsId).sort((a, b) => a - b)
    expect(smsIds).toEqual([sms201.id, sms202.id, sms203.id].sort((a, b) => a - b)) // 203 deduped, not doubled
  })

  it('resolves an approved-vs-rejected collision by latest updatedAt and logs a warning', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    await insertPattern({
      name: 'legacy-approved',
      groupingPattern: '<CUR><AMT>00.00 legacy approved',
      status: PATTERN_STATUS.Approved,
      updatedAt: new Date('2026-02-01T00:00:00Z'), // newer than the rejected row below
    })
    await insertPattern({
      name: 'legacy-rejected',
      groupingPattern: '<CUR> <AMT> legacy rejected',
      status: PATTERN_STATUS.Rejected,
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    })
    sampleStore['legacy-approved'] = [makeSample({ body: CURRENT_BODIES[0] })]
    sampleStore['legacy-rejected'] = [makeSample({ body: CURRENT_BODIES[1] })]

    await recomputeStaleGroupingPatterns(db)

    const rows = await allRows()
    expect(rows).toHaveLength(1)
    expect(rows[0].status).toBe(PATTERN_STATUS.Approved) // approved row is the newer decision
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('merged pattern'))

    warnSpy.mockRestore()
  })

  it('deletes a stale needs-review row without samples, and its patternSmsGroup links', async () => {
    const row = await insertPattern({ name: 'orphan-needs-review', status: PATTERN_STATUS.NeedsReview })
    const sms = await insertSms()
    await insertLink(row.id, sms.id)
    // no MMKV samples seeded — getPatternSamplesByName returns []

    const summary = await recomputeStaleGroupingPatterns(db)

    expect(summary).toEqual({ renamed: 0, merged: 0, deleted: 1, stampedOnly: 0 })
    const remaining = await db.select().from(patterns).where(eq(patterns.id, row.id))
    expect(remaining).toHaveLength(0)
    expect(await linksFor(row.id)).toHaveLength(0)
  })

  it('stamps an approved row without samples, leaving it untouched, and logs a warning', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const row = await insertPattern({
      name: 'orphan-approved',
      groupingPattern: '<CUR><AMT>00.00 orphan approved',
      status: PATTERN_STATUS.Approved,
    })

    const summary = await recomputeStaleGroupingPatterns(db)

    expect(summary).toEqual({ renamed: 0, merged: 0, deleted: 0, stampedOnly: 1 })
    const [updated] = await db.select().from(patterns).where(eq(patterns.id, row.id))
    expect(updated.name).toBe('orphan-approved')
    expect(updated.groupingPattern).toBe('<CUR><AMT>00.00 orphan approved')
    expect(updated.normalizerVersion).toBe(NORMALIZER_VERSION)
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`pattern ${row.id}`))

    warnSpy.mockRestore()
  })

  describe('first-run sweep (the stamping-gap: rows already current-format but stamped at the default 1)', () => {
    it('no-op restamps a row whose groupingPattern is already current-format, when samples exist', async () => {
      const row = await insertPattern({
        name: CURRENT_NAME,
        groupingPattern: CURRENT_TEMPLATE,
        status: PATTERN_STATUS.Approved,
      })
      sampleStore[CURRENT_NAME] = CURRENT_BODIES.map((body) => makeSample({ body }))

      const summary = await recomputeStaleGroupingPatterns(db)

      expect(summary).toEqual({ renamed: 1, merged: 0, deleted: 0, stampedOnly: 0 })
      const [updated] = await db.select().from(patterns).where(eq(patterns.id, row.id))
      expect(updated.name).toBe(CURRENT_NAME)
      expect(updated.groupingPattern).toBe(CURRENT_TEMPLATE)
      expect(updated.normalizerVersion).toBe(NORMALIZER_VERSION)
    })

    it('deletes an already current-format needs-review row when samples are missing', async () => {
      const row = await insertPattern({
        name: CURRENT_NAME,
        groupingPattern: CURRENT_TEMPLATE,
        status: PATTERN_STATUS.NeedsReview,
      })
      // no samples seeded

      const summary = await recomputeStaleGroupingPatterns(db)

      expect(summary).toEqual({ renamed: 0, merged: 0, deleted: 1, stampedOnly: 0 })
      expect(await db.select().from(patterns).where(eq(patterns.id, row.id))).toHaveLength(0)
    })
  })

  it('is a no-op when all rows are already current', async () => {
    await insertPattern({ name: 'already-current', normalizerVersion: NORMALIZER_VERSION })

    const summary = await recomputeStaleGroupingPatterns(db)

    expect(summary).toEqual({ renamed: 0, merged: 0, deleted: 0, stampedOnly: 0 })
  })

  it('is safe to run twice — the second run touches nothing', async () => {
    await insertPattern({ name: 'legacy-idempotent', status: PATTERN_STATUS.Approved })
    sampleStore['legacy-idempotent'] = CURRENT_BODIES.map((body) => makeSample({ body }))

    const first = await recomputeStaleGroupingPatterns(db)
    expect(first.renamed).toBe(1)

    const second = await recomputeStaleGroupingPatterns(db)
    expect(second).toEqual({ renamed: 0, merged: 0, deleted: 0, stampedOnly: 0 })
  })
})
