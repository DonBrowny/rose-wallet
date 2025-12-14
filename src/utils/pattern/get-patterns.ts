import { patterns, type Pattern } from '@/db/schema'
import { getDrizzleDb } from '@/services/database/db'

export interface PatternsByStatus {
  active: Pattern[]
  rejected: Pattern[]
}

export async function getPatterns(): Promise<PatternsByStatus> {
  const db = getDrizzleDb()
  try {
    const allPatterns = await db.select().from(patterns)

    const active: Pattern[] = []
    const rejected: Pattern[] = []

    for (const pattern of allPatterns) {
      if (pattern.status === 'rejected') {
        rejected.push(pattern)
      } else if (pattern.isActive) {
        active.push(pattern)
      }
    }

    return { active, rejected }
  } catch {
    return { active: [], rejected: [] }
  }
}
