import { saveExpense } from '@/services/database/save-expense'
import type { Transaction } from '@/types/sms/transaction'
import { useMutation } from '@tanstack/react-query'

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
  return useMutation({
    mutationFn: saveExpenseWithPattern,
  })
}
