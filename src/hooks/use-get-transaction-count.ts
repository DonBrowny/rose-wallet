import { fetchTransactionCount } from '@/services/database/fetch-transaction-count'
import { FetchPatternsOptions } from '@/types/patterns/patterns'
import { useQuery } from '@tanstack/react-query'

export const TRANSACTION_COUNT_QUERY_KEY = ['transaction-count'] as const

export function useGetTransactionCount(options?: FetchPatternsOptions) {
  return useQuery<number>({
    queryKey: [...TRANSACTION_COUNT_QUERY_KEY, options?.filter?.startDate?.getTime()],
    queryFn: () => fetchTransactionCount(options),
  })
}
