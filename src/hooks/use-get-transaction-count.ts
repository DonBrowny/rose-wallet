import { fetchTransactionCount } from '@/services/database/fetch-transaction-count'
import { useQuery } from '@tanstack/react-query'

export const TRANSACTION_COUNT_QUERY_KEY = ['transaction-count'] as const

interface UseGetTransactionCountOptions {
  filter?: {
    startDate?: Date
  }
}

export function useGetTransactionCount(options?: UseGetTransactionCountOptions) {
  return useQuery<number>({
    queryKey: [...TRANSACTION_COUNT_QUERY_KEY, options?.filter?.startDate?.getTime()],
    queryFn: () => fetchTransactionCount(options),
  })
}
