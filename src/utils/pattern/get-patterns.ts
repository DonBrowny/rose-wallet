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

    return allPatterns.reduce<PatternsByStatus>(
      (acc, p) => {
        if (p.status === 'rejected') {
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
