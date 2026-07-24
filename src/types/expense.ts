import type { NewTransaction, Transaction } from '@/db/schema'

export interface Expense {
  id: number
  amount: number
  merchantName: string
  categoryName: string
  receivedAt: Date
  smsSender?: string
  smsBody?: string
}

export interface ExpenseMonthStats {
  total: number
  count: number
}

export interface InsertTransactionInput extends Pick<NewTransaction, 'amount' | 'currency' | 'type' | 'description'> {
  smsId: number
  categoryId: number
  merchantId: number
}

export interface UpdateTransactionInput extends Pick<Transaction, 'id' | 'amount'> {
  merchantId: number
  categoryId: number
}
