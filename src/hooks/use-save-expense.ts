import { TRANSACTION_TYPE } from '@/db/schema'
import { saveExpense } from '@/services/database/save-expense'
import type { ReviewTxn } from '@/types/sms-parsing'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EXPENSES_BY_MONTH_QUERY_KEY, MONTH_TOTAL_QUERY_KEY } from './use-get-expenses-by-month'
import { GETTING_STARTED_TRANSACTIONS_QUERY_KEY } from './use-getting-started'
import { RECENT_EXPENSES_QUERY_KEY } from './use-get-recent-expenses'
import { SMS_TRANSACTIONS_QUERY_KEY } from './use-sms-transactions'

interface SaveExpenseParams {
  transaction: ReviewTxn
  amount: number
  merchantName: string
  categoryName: string
}

async function saveExpenseWithPattern(params: SaveExpenseParams) {
  const { transaction, amount, merchantName, categoryName } = params

  return saveExpense({
    smsId: transaction.smsId,
    smsDate: transaction.date,
    merchantName: merchantName || transaction.merchantRaw || 'Unknown',
    categoryName: categoryName || 'Other',
    patternId: transaction.patternId,
    amount,
    currency: 'INR',
    type: TRANSACTION_TYPE.Debit,
  })
}

export function useSaveExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveExpenseWithPattern,
    onSuccess: async (_result, { transaction }) => {
      queryClient.invalidateQueries({ queryKey: [MONTH_TOTAL_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [EXPENSES_BY_MONTH_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: RECENT_EXPENSES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [GETTING_STARTED_TRANSACTIONS_QUERY_KEY] })

      // Drop the saved SMS from the cached review list instead of invalidating:
      // a refetch re-runs the whole SMS sync pipeline (native read + queue
      // triage) between every confirm. Cancel any in-flight refetch first so
      // its stale result can't resurrect the item.
      await queryClient.cancelQueries({ queryKey: [SMS_TRANSACTIONS_QUERY_KEY] })
      queryClient.setQueryData<ReviewTxn[]>([SMS_TRANSACTIONS_QUERY_KEY], (old) =>
        old?.filter((t) => t.smsId !== transaction.smsId)
      )
    },
  })
}
