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

export interface InsertTransactionInput {
  smsId: number
  amount: number
  currency: string
  type: 'debit' | 'credit'
  description?: string | null
  categoryId: number
  merchantId: number
}

export interface UpdateTransactionInput {
  id: number
  amount: number
  merchantId: number
  categoryId: number
}
