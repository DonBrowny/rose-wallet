import { fetchMonthlyExpense } from '@/services/database/fetch-monthly-expense'
import { useQuery } from '@tanstack/react-query'

export function useMonthlyExpense() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['monthly-expense'],
    queryFn: fetchMonthlyExpense,
    refetchOnWindowFocus: true,
  })

  return {
    totalExpense: data ?? 0,
    isLoading,
    error,
  }
}
