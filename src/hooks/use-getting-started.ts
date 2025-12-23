import { ChecklistStatus } from '@/components/checklist-item/checklist-item'
import { EXPENSE_TOUR_THRESHOLD, PATTERN_TOUR_THRESHOLD } from '@/constants/tour'
import { fetchPatterns } from '@/services/database/patterns-repository'
import { getExpenseStats } from '@/services/database/transactions-repository'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import { PatternStatus } from '@/types/patterns/enums'
import { storage } from '@/utils/mmkv/storage'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

function getPatternProgress(reviewedCount: number, isDone: boolean): string | undefined {
  if (isDone) return undefined
  return `${reviewedCount}/${PATTERN_TOUR_THRESHOLD} reviewed`
}

function getExpenseProgress(transactionCount: number, isDone: boolean, isLocked: boolean): string | undefined {
  if (isDone) return undefined
  if (isLocked) return 'Complete patterns first'
  return `${transactionCount}/${EXPENSE_TOUR_THRESHOLD} added`
}

function getExpenseStatus(isDone: boolean, canStart: boolean): ChecklistStatus {
  if (isDone) return 'completed'
  if (canStart) return 'pending'
  return 'locked'
}

function parseStartDate(lastSeenDate: string | undefined): Date | undefined {
  if (!lastSeenDate) return undefined
  const timestamp = parseInt(lastSeenDate, 10)
  if (Number.isNaN(timestamp)) return undefined
  return new Date(timestamp)
}

export function useGettingStarted() {
  const lastSeenDate = storage.getString(MMKV_KEYS.APP.GETTING_STARTED_SEEN_AT)
  const startDate = parseStartDate(lastSeenDate)
  const startDateKey = startDate?.getTime() ?? null

  const { data: patterns } = useQuery({
    queryKey: ['getting-started-patterns', startDateKey],
    queryFn: () => fetchPatterns({ filter: { startDate } }),
  })

  const { data: expenseStats } = useQuery({
    queryKey: ['getting-started-transactions', startDateKey],
    queryFn: () => getExpenseStats({ filter: { startDate } }),
  })

  const transactionCount = expenseStats?.count ?? 0

  const reviewedCount = useMemo(() => {
    if (!patterns) return 0
    return patterns.filter((p) => p.status !== PatternStatus.NeedsReview).length
  }, [patterns])

  const patternTourDone = reviewedCount >= PATTERN_TOUR_THRESHOLD
  const expenseTourDone = transactionCount >= EXPENSE_TOUR_THRESHOLD
  const allTasksCompleted = patternTourDone && expenseTourDone

  return {
    patternTourDone,
    expenseTourDone,
    allTasksCompleted,
    patternStatus: patternTourDone ? 'completed' : ('pending' as ChecklistStatus),
    patternProgress: getPatternProgress(reviewedCount, patternTourDone),
    expenseStatus: getExpenseStatus(expenseTourDone, patternTourDone),
    expenseProgress: getExpenseProgress(transactionCount, expenseTourDone, !patternTourDone),
  }
}
