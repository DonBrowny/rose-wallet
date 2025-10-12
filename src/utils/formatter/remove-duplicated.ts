import { type Transaction } from '@/types/sms/transaction'

export function removeDuplicates(transactions: Transaction[]): Transaction[] {
  const seen = new Set<string>()
  return transactions.filter((transaction) => {
    // Use raw SMS as the primary key for deduplication
    const key = transaction.message.body
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}
