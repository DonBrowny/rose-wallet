import { saveExpense } from '@/services/database/save-expense'
import type { Transaction } from '@/types/sms/transaction'
import { getActivePatterns } from '@/utils/pattern/get-active-patterns'
import { matchPatternAndExtract } from '@/utils/pattern/match-pattern-and-extract'
import { useMutation } from '@tanstack/react-query'

interface SaveExpenseParams {
  transaction: Transaction
  amount: number
  merchantName: string
  categoryName: string
}

async function saveExpenseWithPattern(params: SaveExpenseParams) {
  const { transaction, amount, merchantName, categoryName } = params

  const patterns = await getActivePatterns()
  const match = await matchPatternAndExtract(transaction.message.body, patterns)

  return saveExpense({
    smsBody: transaction.message.body,
    smsSender: transaction.message.address,
    smsDate: transaction.message.date,
    merchantName: merchantName || transaction.merchant || 'Unknown',
    categoryName: categoryName || 'Other',
    patternName: match.patternName,
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
