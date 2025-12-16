import { fetchExpensesByMonth, fetchMonthTotal } from '@/services/database/fetch-expenses-by-month'
import type { Expense } from '@/types/expense'
import { useQuery } from '@tanstack/react-query'

export const EXPENSES_BY_MONTH_QUERY_KEY = ['expenses-by-month'] as const

export function useGetExpensesByMonth(year: number, month: number) {
  return useQuery<Expense[]>({
    queryKey: [...EXPENSES_BY_MONTH_QUERY_KEY, year, month],
    queryFn: () => fetchExpensesByMonth(year, month),
  })
}

export function useGetMonthTotal(year: number, month: number) {
  return useQuery<number>({
    queryKey: ['month-total', year, month],
    queryFn: () => fetchMonthTotal(year, month),
  })
}
