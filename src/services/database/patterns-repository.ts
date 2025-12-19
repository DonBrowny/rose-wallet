import { patterns, patternSmsGroup } from '@/db/schema'
import { PatternStatus, PatternType } from '@/types/patterns/enums'
import { FetchPatternsOptions } from '@/types/patterns/patterns'
import type { DistinctPattern } from '@/types/sms/transaction'
import { murmurHash32 } from '@/utils/hash/murmur32'
import { and, eq, gte, sql } from 'drizzle-orm'
import { getDrizzleDb } from './db'

export async function upsertPatternsByGrouping(distinct: DistinctPattern[]): Promise<void> {
  const db = getDrizzleDb()
  const rows = distinct.map((p) => ({
    name: murmurHash32(p.groupingTemplate),
    groupingPattern: p.groupingTemplate,
    extractionPattern: p.template,
    type: PatternType.Debit,
    status: p.status,
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  await db
    .insert(patterns)
    .values(rows)
    .onConflictDoUpdate({
      target: patterns.name,
      set: {
        extractionPattern: sql`excluded.extraction_pattern`,
        type: sql`excluded.type`,
        status: sql`excluded.status`,
        updatedAt: new Date(),
      },
    })
    .catch((error) => {
      console.error('Error inserting patterns', error)
    })
}

export async function updatePatternStatusById(id: number, status: 'approved' | 'needs-review' | 'rejected') {
  const db = getDrizzleDb()
  await db.update(patterns).set({ status, updatedAt: new Date() }).where(eq(patterns.id, id))
}

export async function updatePatternTemplateByName(name: string, extractionPattern: string) {
  const db = getDrizzleDb()
  await db
    .update(patterns)
    .set({ extractionPattern, updatedAt: new Date(), status: 'approved' })
    .where(eq(patterns.name, name))
}

export async function getPatternByName(name: string) {
  const db = getDrizzleDb()
  const rows = await db.select().from(patterns).where(eq(patterns.name, name))
  return rows[0]
}

export async function ensurePatternSmsGroupLink(patternId: number, smsId: number, confidence: number = 1.0) {
  const db = getDrizzleDb()
  const existing = await db
    .select()
    .from(patternSmsGroup)
    .where(and(eq(patternSmsGroup.patternId, patternId), eq(patternSmsGroup.smsId, smsId)))
  if (!existing[0]) {
    await db.insert(patternSmsGroup).values({ patternId, smsId, confidence })
  }
}

export async function fetchPatterns(options?: FetchPatternsOptions): Promise<DistinctPattern[]> {
  const db = getDrizzleDb()

  const query = db
    .select({
      id: patterns.id,
      template: patterns.extractionPattern,
      groupingTemplate: patterns.groupingPattern,
      status: patterns.status,
      type: patterns.type,
      usageCount: patterns.usageCount,
    })
    .from(patterns)

  const startDate = options?.filter?.startDate
  const data = startDate ? await query.where(gte(patterns.createdAt, startDate)) : await query

  return data.map((row) => ({
    id: String(row.id),
    template: row.template ?? '',
    groupingTemplate: row.groupingTemplate ?? '',
    occurrences: row.usageCount ?? 0,
    transactions: [],
    patternType: (row.type as PatternType) ?? PatternType.Debit,
    status: (row.status as PatternStatus) ?? PatternStatus.NeedsReview,
  }))
}
