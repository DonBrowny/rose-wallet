import { fetchPatterns } from '@/services/database/patterns-repository'
import { FilterOptions } from '@/types/filters'
import type { DistinctPattern } from '@/types/sms/transaction'
import { useQuery } from '@tanstack/react-query'

export const PATTERNS_QUERY_KEY = ['patterns'] as const

export function useGetPatterns(options?: FilterOptions) {
  return useQuery<DistinctPattern[]>({
    queryKey: [...PATTERNS_QUERY_KEY, options?.filter?.startDate?.getTime()],
    queryFn: () => fetchPatterns(options),
  })
}
