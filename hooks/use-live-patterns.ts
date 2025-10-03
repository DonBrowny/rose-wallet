import { patterns } from '@/db/schema'
import { PatternStatus, PatternType } from '@/types/patterns/enums'
import type { DistinctPattern } from '@/types/sms/transaction'
import { drizzle, useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { useSQLiteContext } from 'expo-sqlite'
import { useMemo } from 'react'

export function useLivePatterns(): {
  data: DistinctPattern[]
  isLoading: boolean
  error: unknown
} {
  const sqlite = useSQLiteContext()
  const db = useMemo(() => drizzle(sqlite), [sqlite])

  const { data, error } = useLiveQuery(
    db
      .select({
        id: patterns.id,
        template: patterns.extractionPattern,
        groupingTemplate: patterns.groupingPattern,
        status: patterns.status,
        type: patterns.type,
        usageCount: patterns.usageCount,
      })
      .from(patterns)
  )

  const mapped: DistinctPattern[] = (data || []).map((row) => ({
    id: String(row.id),
    template: row.template ?? '',
    groupingTemplate: row.groupingTemplate ?? '',
    occurrences: row.usageCount ?? 0,
    transactions: [], // transactions come from MMKV samples when reviewing
    patternType: (row.type as PatternType) ?? PatternType.Debit,
    status: (row.status as PatternStatus) ?? PatternStatus.NeedsReview,
  }))

  return { data: mapped, isLoading: !data && !error, error }
}
