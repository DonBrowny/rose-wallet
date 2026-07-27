import { TRANSACTION_TYPE } from '@/db/schema'
import { saveExpense } from '@/services/database/save-expense'
import type { ReviewTxn } from '@/types/sms-parsing'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EXPENSES_BY_MONTH_QUERY_KEY, MONTH_TOTAL_QUERY_KEY } from './use-get-expenses-by-month'
import { GETTING_STARTED_TRANSACTIONS_QUERY_KEY } from './use-getting-started'
import { RECENT_EXPENSES_QUERY_KEY } from './use-get-recent-expenses'
import { removeReviewedSmsFromCache } from './use-sms-transactions'

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

      await removeReviewedSmsFromCache(queryClient, transaction.smsId)
    },
  })
}
