import { fetchExpensesByMonth, getExpenseStats } from '@/services/database/transactions-repository'
import type { Expense, ExpenseMonthStats } from '@/types/expense'
import { getMonthRange } from '@/utils/date/get-month-range'
import { GroupedExpenseItem, groupExpensesByDate } from '@/utils/expense/group-expenses-by-date'
import { useQuery } from '@tanstack/react-query'

export const EXPENSES_BY_MONTH_QUERY_KEY = ['expenses-by-month'] as const
export const MONTH_TOTAL_QUERY_KEY = ['month-total'] as const

export interface MonthExpensesData {
  groupedItems: GroupedExpenseItem[]
  totalAmount: number
  count: number
}

function transformExpenses(expenses: Expense[]): MonthExpensesData {
  return {
    groupedItems: groupExpensesByDate(expenses),
    totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
    count: expenses.length,
  }
}

export function useGetExpensesByMonth(year: number, month: number) {
  return useQuery({
    queryKey: [...EXPENSES_BY_MONTH_QUERY_KEY, year, month],
    queryFn: () => fetchExpensesByMonth(year, month),
    select: transformExpenses,
  })
}

export function useGetMonthTotal(year: number, month: number) {
  const { start, end } = getMonthRange(year, month)
  return useQuery<ExpenseMonthStats>({
    queryKey: [...MONTH_TOTAL_QUERY_KEY, year, month],
    queryFn: () => getExpenseStats({ filter: { startDate: start, endDate: end } }),
  })
}
