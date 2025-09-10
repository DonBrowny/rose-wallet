export type Intent = 'not_txn' | 'expense' | 'income' | 'future_payments'

export type Channel = 'upi' | 'imps' | 'neft' | 'rtgs' | 'pos' | 'atm' | 'netbanking' | 'unknown'

export interface Transaction {
  id: string
  amount: number
  merchant: string
  transactionType: 'debit' | 'credit'
  bankName: string
  transactionDate: Date
  category?: string
  message: SMSMessage
}

export interface SMSMessage {
  id: string
  body: string
  address: string // sender number
  date: number
  read: boolean
}

export interface DistinctPattern {
  id: string
  template: string
  sampleSMS: string // first occurrence of this pattern
  occurrences: number
  transactions: Transaction[]
  patternType: string // UPI_DEBIT, UPI_CREDIT, CARD_TRANSACTION, etc.
  confidence: number // similarity confidence score
  variableFields: string[] // detected variable fields like [AMOUNT], [DATE], etc.
}

export interface TransactionPattern {
  success: boolean
  transactions: Transaction[]
  distinctPatterns: DistinctPattern[]
  totalSMSRead: number
  totalTransactions: number
  totalPatterns: number
  errors: string[]
}
