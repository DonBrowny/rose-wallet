import { deleteTransaction } from '@/services/database/transactions-repository'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EXPENSES_BY_MONTH_QUERY_KEY, MONTH_TOTAL_QUERY_KEY } from './use-get-expenses-by-month'
import { GETTING_STARTED_TRANSACTIONS_QUERY_KEY } from './use-getting-started'
import { RECENT_EXPENSES_QUERY_KEY } from './use-get-recent-expenses'

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MONTH_TOTAL_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: EXPENSES_BY_MONTH_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: RECENT_EXPENSES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [GETTING_STARTED_TRANSACTIONS_QUERY_KEY] })
    },
  })
}
