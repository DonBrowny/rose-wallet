import { patterns, type Pattern } from '@/db/schema'
import { getDrizzleDb } from '@/services/database/db'
import { and, eq, ne } from 'drizzle-orm'

export async function getActivePatterns(): Promise<Pattern[]> {
  const db = getDrizzleDb()
  try {
    return await db
      .select()
      .from(patterns)
      .where(and(eq(patterns.isActive, true), ne(patterns.status, 'rejected')))
  } catch {
    return []
  }
}
