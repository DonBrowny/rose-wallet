import { fetchMonthlyExpense } from '@/services/database/fetch-monthly-expense'
import { useQuery } from '@tanstack/react-query'

export const MONTHLY_EXPENSE_QUERY_KEY = ['monthly-expense']

export function useMonthlyExpense() {
  const { data, isLoading, error } = useQuery({
    queryKey: MONTHLY_EXPENSE_QUERY_KEY,
    queryFn: fetchMonthlyExpense,
    refetchOnWindowFocus: true,
  })

  return {
    totalExpense: data ?? 0,
    isLoading,
    error,
  }
}
