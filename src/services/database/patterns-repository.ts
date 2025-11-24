import { patterns, patternSmsGroup } from '@/db/schema'
import { PatternType } from '@/types/patterns/enums'
import type { DistinctPattern } from '@/types/sms/transaction'
import { murmurHash32 } from '@/utils/hash/murmur32'
import { and, eq, sql } from 'drizzle-orm'
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
