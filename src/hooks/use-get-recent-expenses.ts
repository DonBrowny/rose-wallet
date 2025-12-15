import { fetchRecentExpenses } from '@/services/database/fetch-recent-expenses'
import type { Expense } from '@/types/expense'
import { useQuery } from '@tanstack/react-query'

export const RECENT_EXPENSES_QUERY_KEY = ['recent-expenses'] as const

export function useGetRecentExpenses(limit?: number) {
  return useQuery<Expense[]>({
    queryKey: [...RECENT_EXPENSES_QUERY_KEY, limit],
    queryFn: () => fetchRecentExpenses(limit),
  })
}
