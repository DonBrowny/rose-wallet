import { patterns, type Pattern } from '@/db/schema'
import { getDrizzleDb } from '@/services/database/db'
import { eq } from 'drizzle-orm'

export async function getRejectedPatterns(): Promise<Pattern[]> {
  const db = getDrizzleDb()
  try {
    return await db.select().from(patterns).where(eq(patterns.status, 'rejected'))
  } catch {
    return []
  }
}
