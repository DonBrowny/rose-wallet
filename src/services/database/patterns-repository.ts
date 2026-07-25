import {
  PATTERN_STATUS,
  patterns,
  patternSmsGroup,
  TRANSACTION_TYPE,
  type Pattern,
  type PatternStatus,
} from '@/db/schema'
import { FilterOptions } from '@/types/filters'
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
    type: TRANSACTION_TYPE.Debit,
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

export async function updatePatternStatusById(id: number, status: PatternStatus) {
  const db = getDrizzleDb()
  await db.update(patterns).set({ status, updatedAt: new Date() }).where(eq(patterns.id, id))
}

export async function updatePatternTemplateByName(name: string, extractionPattern: string) {
  const db = getDrizzleDb()
  await db
    .update(patterns)
    .set({
      extractionPattern,
      extractionRegex: null,
      updatedAt: new Date(),
      status: PATTERN_STATUS.Approved,
    })
    .where(eq(patterns.name, name))
}

export async function incrementPatternUsageByName(name: string, count: number) {
  if (count <= 0) return
  const db = getDrizzleDb()
  await db
    .update(patterns)
    .set({ usageCount: sql`${patterns.usageCount} + ${count}`, lastUsedAt: new Date(), updatedAt: new Date() })
    .where(eq(patterns.name, name))
}

export interface PatternsByStatus {
  active: Pattern[]
  rejected: Pattern[]
}

export async function getPatterns(): Promise<PatternsByStatus> {
  const db = getDrizzleDb()
  try {
    const allPatterns = await db.select().from(patterns)

    return allPatterns.reduce<PatternsByStatus>(
      (acc, p) => {
        if (p.status === PATTERN_STATUS.Rejected) {
          acc.rejected.push(p)
        } else if (p.isActive) {
          acc.active.push(p)
        }
        return acc
      },
      { active: [], rejected: [] }
    )
  } catch {
    return { active: [], rejected: [] }
  }
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

export async function fetchPatterns(options?: FilterOptions): Promise<DistinctPattern[]> {
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
    patternType: row.type,
    status: row.status,
  }))
}
