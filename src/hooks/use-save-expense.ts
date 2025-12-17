import { saveExpense } from '@/services/database/save-expense'
import type { Transaction } from '@/types/sms/transaction'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EXPENSES_BY_MONTH_QUERY_KEY, MONTH_TOTAL_QUERY_KEY } from './use-get-expenses-by-month'
import { RECENT_EXPENSES_QUERY_KEY } from './use-get-recent-expenses'

interface SaveExpenseParams {
  transaction: Transaction
  amount: number
  merchantName: string
  categoryName: string
}

async function saveExpenseWithPattern(params: SaveExpenseParams) {
  const { transaction, amount, merchantName, categoryName } = params

  return saveExpense({
    smsBody: transaction.message.body,
    smsSender: transaction.message.address,
    smsDate: transaction.message.date,
    merchantName: merchantName || transaction.merchant || 'Unknown',
    categoryName: categoryName || 'Other',
    patternId: transaction.patternId,
    amount,
    currency: 'INR',
    type: 'debit',
  })
}

export function useSaveExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveExpenseWithPattern,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MONTH_TOTAL_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: EXPENSES_BY_MONTH_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: RECENT_EXPENSES_QUERY_KEY })
    },
  })
}
