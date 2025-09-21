export type Intent = 'not_txn' | 'expense' | 'income'

export interface Transaction {
  id: string
  amount: number
  merchant: string
  bankName: string
  transactionDate: Date
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
  patternType: 'DEBIT' | 'CREDIT'
  confidence: number // similarity confidence score
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
