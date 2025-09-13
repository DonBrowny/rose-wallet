import type { Transaction } from '@/types/sms/transaction'
import { formatCurrency } from './format-utils'

export function formatTransactionForDisplay(transaction: Transaction): {
  amount: string
  merchant: string
  date: string
  bank: string
  category: string
} {
  // Ensure we have a valid date
  const transactionDate =
    transaction.transactionDate instanceof Date ? transaction.transactionDate : new Date(transaction.transactionDate)

  return {
    amount: formatCurrency(transaction.amount),
    merchant: transaction.merchant,
    date: transactionDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    bank: transaction.bankName,
    category: transaction.category || 'Other',
  }
}
