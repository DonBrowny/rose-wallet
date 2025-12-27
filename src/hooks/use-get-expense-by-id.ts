import { fetchExpenseById } from '@/services/database/transactions-repository'
import { useQuery } from '@tanstack/react-query'

export function useGetExpenseById(id: number | null) {
  return useQuery({
    queryKey: ['expense-by-id', id],
    queryFn: () => fetchExpenseById(id!),
    enabled: id !== null,
    staleTime: 0,
    gcTime: 0,
  })
}
