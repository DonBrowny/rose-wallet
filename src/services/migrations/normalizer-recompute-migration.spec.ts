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
import { upsertPatternsByGrouping } from '@/services/database/patterns-repository'
import type { ReviewTxn } from '@/types/sms-parsing'
import type { DistinctPattern } from '@/types/sms/transaction'
import { murmurHash32 } from '@/utils/hash/murmur32'
import {
  deletePatternSamplesByName,
  getPatternSamplesByName,
  setPatternSamplesByName,
} from '@/utils/mmkv/pattern-samples'
import { bigrams } from '@/utils/pattern/bigrams'
import { matchPattern } from '@/utils/pattern/match-pattern'
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

// Lets the real upsertPatternsByGrouping run against the injected libsql test DB
// (the continuity tests exercise the actual discovery conflict path, not a mock).
let mockDb: ReturnType<typeof drizzle> | undefined
jest.mock('@/services/database/db', () => ({
  getDrizzleDb: () => mockDb,
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
    mockDb = db
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

    expect(summary).toEqual({ recomputed: 1, merged: 0, deleted: 0, stampedOnly: 0 })

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
    const sms203 = await insertSms()

    // Sample-level overlap on sms202, placed BEFORE the cap boundary so an undeduped
    // union would waste a slot on the duplicate and silently drop sms203 entirely
    // (a naive slice(0, 3) of [201, 202, 202-dup, 203] never reaches 203).
    sampleStore['legacy-a'] = [
      makeSample({ body: CURRENT_BODIES[0], smsId: sms201.id }),
      makeSample({ body: CURRENT_BODIES[1], smsId: sms202.id }),
    ]
    sampleStore['legacy-b'] = [
      makeSample({ body: CURRENT_BODIES[1], smsId: sms202.id }),
      makeSample({ body: CURRENT_BODIES[0], smsId: sms203.id }),
    ]

    // Link-level overlap on sms203 (independent of the sample overlap above) — must
    // dedupe after repoint too.
    await insertLink(rowA.id, sms201.id)
    await insertLink(rowA.id, sms203.id)
    await insertLink(rowB.id, sms202.id)
    await insertLink(rowB.id, sms203.id)

    const summary = await recomputeStaleGroupingPatterns(db)

    // rowA is processed first and claims the converged name via a rename (neither row
    // started out named that); rowB then collides into it and merges.
    expect(summary).toEqual({ recomputed: 1, merged: 1, deleted: 0, stampedOnly: 0 })

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
    // Deduped by smsId first, then capped — all 3 distinct messages survive instead of
    // wasting a slot on the sms202 duplicate and losing sms203.
    const unionedSmsIds = sampleStore[CURRENT_NAME].map((s) => s.smsId).sort((a, b) => a - b)
    expect(unionedSmsIds).toEqual([sms201.id, sms202.id, sms203.id].sort((a, b) => a - b))

    const links = await linksFor(survivor.id)
    const smsIds = links.map((l) => l.smsId).sort((a, b) => a - b)
    expect(smsIds).toEqual([sms201.id, sms202.id, sms203.id].sort((a, b) => a - b)) // 203 deduped, not doubled
  })

  it("preserves a merge survivor's accumulated state across a 3-way collision within one sweep", async () => {
    // Processing order (ascending id) matters here: B and C must merge into A's slot
    // BEFORE A itself is reprocessed, so A's own pass is the one at risk of resetting
    // the map to its stale pre-sweep usageCount and silently dropping B's and C's
    // contributions — a loss only D's later merge would actually surface.
    await insertPattern({
      name: 'legacy-b-3way',
      groupingPattern: '<CUR><AMT>00.00 legacy b 3way',
      usageCount: 10,
    })
    await insertPattern({
      name: 'legacy-c-3way',
      groupingPattern: '<CUR> <AMT> legacy c 3way',
      usageCount: 100,
    })
    // Already current-format but stale only from the pre-fix stamping gap, so its own
    // recompute is a no-op rename onto its own name — exactly the shape that risks
    // re-seeding the running survivor state instead of preserving it.
    const rowA = await insertPattern({
      name: CURRENT_NAME,
      groupingPattern: CURRENT_TEMPLATE,
      usageCount: 1,
    })
    await insertPattern({
      name: 'legacy-d-3way',
      groupingPattern: '<CUR><AMT>00.00 legacy d 3way',
      usageCount: 1000,
    })

    sampleStore['legacy-b-3way'] = [makeSample({ body: CURRENT_BODIES[0], smsId: 901 })]
    sampleStore['legacy-c-3way'] = [makeSample({ body: CURRENT_BODIES[1], smsId: 902 })]
    sampleStore[CURRENT_NAME] = [makeSample({ body: CURRENT_BODIES[2], smsId: 903 })]
    sampleStore['legacy-d-3way'] = [makeSample({ body: CURRENT_BODIES[0], smsId: 904 })]

    const summary = await recomputeStaleGroupingPatterns(db)

    expect(summary.recomputed).toBe(1) // rowA's own no-op rename
    expect(summary.merged).toBe(3) // B, then C, then D — all into rowA

    const rows = await allRows()
    expect(rows).toHaveLength(1)
    expect(rows[0].id).toBe(rowA.id)
    // If rowA's reprocessing had reset the running total to its own stale pre-sweep
    // usageCount (1), rowD's merge would land on 1 + 1000 = 1001, silently dropping
    // rowB's and rowC's contributions instead of the correct sum of all four.
    expect(rows[0].usageCount).toBe(10 + 100 + 1 + 1000)
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

    expect(summary).toEqual({ recomputed: 0, merged: 0, deleted: 1, stampedOnly: 0 })
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

    expect(summary).toEqual({ recomputed: 0, merged: 0, deleted: 0, stampedOnly: 1 })
    const [updated] = await db.select().from(patterns).where(eq(patterns.id, row.id))
    expect(updated.name).toBe('orphan-approved')
    expect(updated.groupingPattern).toBe('<CUR><AMT>00.00 orphan approved')
    expect(updated.normalizerVersion).toBe(NORMALIZER_VERSION)
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`pattern ${row.id}`))

    warnSpy.mockRestore()
  })

  describe('samples present but unusable (every body normalizes to empty)', () => {
    it('deletes a needs-review row instead of crashing the sweep', async () => {
      const row = await insertPattern({ name: 'blank-needs-review', status: PATTERN_STATUS.NeedsReview })
      sampleStore['blank-needs-review'] = [makeSample({ body: '   ' }), makeSample({ body: '' })]

      const summary = await recomputeStaleGroupingPatterns(db)

      expect(summary).toEqual({ recomputed: 0, merged: 0, deleted: 1, stampedOnly: 0 })
      expect(await db.select().from(patterns).where(eq(patterns.id, row.id))).toHaveLength(0)
    })

    it('stamps an approved row without recomputing instead of crashing the sweep', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      const row = await insertPattern({
        name: 'blank-approved',
        groupingPattern: '<CUR><AMT>00.00 blank approved',
        status: PATTERN_STATUS.Approved,
      })
      sampleStore['blank-approved'] = [makeSample({ body: '' })]

      const summary = await recomputeStaleGroupingPatterns(db)

      expect(summary).toEqual({ recomputed: 0, merged: 0, deleted: 0, stampedOnly: 1 })
      const [updated] = await db.select().from(patterns).where(eq(patterns.id, row.id))
      expect(updated.groupingPattern).toBe('<CUR><AMT>00.00 blank approved')
      expect(updated.normalizerVersion).toBe(NORMALIZER_VERSION)
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('no usable samples'))

      warnSpy.mockRestore()
    })
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

      expect(summary).toEqual({ recomputed: 1, merged: 0, deleted: 0, stampedOnly: 0 })
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

      expect(summary).toEqual({ recomputed: 0, merged: 0, deleted: 1, stampedOnly: 0 })
      expect(await db.select().from(patterns).where(eq(patterns.id, row.id))).toHaveLength(0)
    })
  })

  it('is a no-op when all rows are already current', async () => {
    await insertPattern({ name: 'already-current', normalizerVersion: NORMALIZER_VERSION })

    const summary = await recomputeStaleGroupingPatterns(db)

    expect(summary).toEqual({ recomputed: 0, merged: 0, deleted: 0, stampedOnly: 0 })
  })

  it('is safe to run twice — the second run touches nothing', async () => {
    await insertPattern({ name: 'legacy-idempotent', status: PATTERN_STATUS.Approved })
    sampleStore['legacy-idempotent'] = CURRENT_BODIES.map((body) => makeSample({ body }))

    const first = await recomputeStaleGroupingPatterns(db)
    expect(first.recomputed).toBe(1)

    const second = await recomputeStaleGroupingPatterns(db)
    expect(second).toEqual({ recomputed: 0, merged: 0, deleted: 0, stampedOnly: 0 })
  })

  describe('continuity across a normalizer bump (doc acceptance criterion)', () => {
    // The constant itself can't be bumped inside a test, but a bump's observable state
    // can: rows stamped below NORMALIZER_VERSION whose groupingPattern is an older
    // format, with MMKV samples carrying the original bodies. Bodies below are real
    // format families from sms-extraction-corpus.spec.ts (digits/names cooked per its
    // convention); each family seeds two sample bodies, and `fresh` is a held-out
    // message of the same format "arriving" after the recompute.
    interface ContinuityFamily {
      staleName: string
      staleTemplate: string
      status: (typeof PATTERN_STATUS)[keyof typeof PATTERN_STATUS]
      samples: string[]
      fresh: string
    }

    // corpus: 'hdfc upi debit to biller vpa, cta tail "to report"'
    const HDFC_VPA: ContinuityFamily = {
      staleName: 'stale-hdfc-vpa',
      staleTemplate:
        '<CUR><AMT>00.00 debited from a/c **<NUM> on <NUM>-<NUM>-<NUM> to VPA <MERCH>(UPI Ref No <NUM>). Not you? Call on <NUM> to report',
      status: PATTERN_STATUS.Approved,
      samples: [
        'Rs 589.00 debited from a/c **5432 on 29-05-19 to VPA billdesk.airtel-postpaid@icici(UPI Ref No 543210987654). Not you? Call on 54321098765 to report',
        'Rs 1,249.00 debited from a/c **5432 on 14-08-19 to VPA billdesk.tneb@icici(UPI Ref No 543210912345). Not you? Call on 54321098765 to report',
      ],
      fresh:
        'Rs 60.00 debited from a/c **5432 on 02-01-20 to VPA storeskm@okicici(UPI Ref No 543219876543). Not you? Call on 54321098765 to report',
    }

    // corpus: 'sbi upi transfer, amount without currency marker'
    const SBI_TRF: ContinuityFamily = {
      staleName: 'stale-sbi-trf',
      staleTemplate:
        'Dear UPI user A/C X<NUM> debited by <AMT>0.0 on date <NUM><MERCH> Refno <NUM>. If not u? call <NUM>. -SBI',
      status: PATTERN_STATUS.Approved,
      samples: [
        'Dear UPI user A/C X5432 debited by 50.0 on date 05May24 trf to Mr Arun Prakash Refno 543210987654. If not u? call 5432109876. -SBI',
        'Dear UPI user A/C X5432 debited by 250.0 on date 18Jun24 trf to Mrs Kavitha R Refno 543210955555. If not u? call 5432109876. -SBI',
      ],
      fresh:
        'Dear UPI user A/C X5432 debited by 1500.0 on date 02Jul24 trf to PARKING PLAZA Refno 543210911111. If not u? call 5432109876. -SBI',
    }

    // corpus: 'icici credit card spend with Avl Lmt tail' — rejected, so this family
    // also covers suppression continuity (the PR #46 bug class: rejected patterns
    // resurfacing after a normalizer change).
    const ICICI_CARD: ContinuityFamily = {
      staleName: 'stale-icici-card',
      staleTemplate:
        '<CUR> <AMT>0.00 spent on ICICI Bank Card XX<NUM> at IND*<MERCH> -. Avl Lmt: <CUR> <NUM>. To dispute,call <NUM>/SMS BLOCK <NUM> to <NUM>',
      status: PATTERN_STATUS.Rejected,
      samples: [
        'INR 920.00 spent on ICICI Bank Card XX5432 on 13-Oct-23 at IND*Amazon.in -. Avl Lmt: INR 2,63,617.00. To dispute,call 18002662/SMS BLOCK 4321 to 5432109876',
        'INR 1,499.00 spent on ICICI Bank Card XX5432 on 02-Nov-23 at IND*Flipkart.com -. Avl Lmt: INR 1,13,618.00. To dispute,call 18002662/SMS BLOCK 4321 to 5432109876',
      ],
      fresh:
        'INR 75.50 spent on ICICI Bank Card XX5432 on 25-Dec-23 at IND*Zomato.in -. Avl Lmt: INR 98,760.00. To dispute,call 18002662/SMS BLOCK 4321 to 5432109876',
    }

    const FAMILIES = [HDFC_VPA, SBI_TRF, ICICI_CARD]

    function toCandidates<T extends { groupingPattern: string }>(rows: T[]) {
      return rows.map((row) => ({
        value: row,
        groupingPattern: row.groupingPattern,
        bigrams: bigrams(row.groupingPattern),
      }))
    }

    async function seedFamilies() {
      const idByStaleName = new Map<string, number>()
      for (const family of FAMILIES) {
        const row = await insertPattern({
          name: family.staleName,
          groupingPattern: family.staleTemplate,
          status: family.status,
        })
        sampleStore[family.staleName] = family.samples.map((body, i) => makeSample({ body, smsId: 800 + i }))
        idByStaleName.set(family.staleName, row.id)
      }
      return idByStaleName
    }

    it('recomputed patterns keep matching fresh messages of their format, and rejected ones keep suppressing', async () => {
      const idByStaleName = await seedFamilies()

      const summary = await recomputeStaleGroupingPatterns(db)
      expect(summary).toEqual({ recomputed: 3, merged: 0, deleted: 0, stampedOnly: 0 })

      const rows = await allRows()
      expect(rows).toHaveLength(3)
      for (const row of rows) {
        expect(row.normalizerVersion).toBe(NORMALIZER_VERSION)
      }

      // Match the way sms-sync-service does: normalized fresh body against
      // active/rejected candidates (exact fast path, Dice >= 0.8 fallback).
      const active = toCandidates(rows.filter((r) => r.status !== PATTERN_STATUS.Rejected))
      const rejected = toCandidates(rows.filter((r) => r.status === PATTERN_STATUS.Rejected))

      const hdfcMatch = matchPattern(normalizeSMSTemplate(HDFC_VPA.fresh), active)
      expect(hdfcMatch?.value.id).toBe(idByStaleName.get(HDFC_VPA.staleName))

      const sbiMatch = matchPattern(normalizeSMSTemplate(SBI_TRF.fresh), active)
      expect(sbiMatch?.value.id).toBe(idByStaleName.get(SBI_TRF.staleName))

      const suppressed = matchPattern(normalizeSMSTemplate(ICICI_CARD.fresh), rejected)
      expect(suppressed?.value.id).toBe(idByStaleName.get(ICICI_CARD.staleName))
    })

    it('a later discovery of the same format upserts into the recomputed row instead of duplicating', async () => {
      await seedFamilies()
      await recomputeStaleGroupingPatterns(db)

      const [hdfcRow] = (await allRows()).filter((r) => r.groupingPattern === normalizeSMSTemplate(HDFC_VPA.samples[0]))
      expect(hdfcRow).toBeDefined()

      // Hash stability is what makes the upsert land on the same row: a fresh message
      // of the format must normalize to exactly the recomputed groupingPattern.
      const freshTemplate = normalizeSMSTemplate(HDFC_VPA.fresh)
      expect(freshTemplate).toBe(hdfcRow.groupingPattern)

      const draft: DistinctPattern = {
        id: '1',
        template: 'Rs <AMT> debited from a/c **5432 to VPA <MERCHANT>',
        groupingTemplate: freshTemplate,
        occurrences: 1,
        transactions: [],
        patternType: TRANSACTION_TYPE.Debit,
        status: PATTERN_STATUS.NeedsReview,
      }
      await upsertPatternsByGrouping([draft])

      const rows = await allRows()
      expect(rows).toHaveLength(3) // updated in place — no fourth row
      const [updated] = rows.filter((r) => r.id === hdfcRow.id)
      expect(updated.name).toBe(murmurHash32(freshTemplate))
      expect(updated.normalizerVersion).toBe(NORMALIZER_VERSION) // conflict path restamps too
    })
  })
})
