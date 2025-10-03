import { patterns } from '@/db/schema'
import { PatternType } from '@/types/patterns/enums'
import type { DistinctPattern } from '@/types/sms/transaction'
import { murmurHash32 } from '@/utils/hash/murmur32'
import { eq, sql } from 'drizzle-orm'
import { getDrizzleDb } from './db'

function deriveName(p: DistinctPattern): string {
  // Stable compact name from grouping template
  return murmurHash32(p.groupingTemplate)
}

export async function upsertPatternsByGrouping(distinct: DistinctPattern[]): Promise<void> {
  const db = getDrizzleDb()
  // Prepare rows
  const rows = distinct.map((p) => ({
    name: deriveName(p),
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
