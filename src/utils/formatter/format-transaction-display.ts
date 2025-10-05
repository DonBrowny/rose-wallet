import type { Transaction } from '@/types/sms/transaction'
import { formatLargeCurrency } from './format-large-currency'

export function formatTransactionForDisplay(transaction: Transaction): {
  amount: string
  merchant: string
  date: string
  bank: string
} {
  // Ensure we have a valid date
  const transactionDate =
    transaction.transactionDate instanceof Date ? transaction.transactionDate : new Date(transaction.transactionDate)

  return {
    amount: formatLargeCurrency(transaction.amount),
    merchant: transaction.merchant,
    date: transactionDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    bank: transaction.bankName,
  }
}
