import type { PatternStatusType, PatternTypeType } from '../patterns/enums'

export type Intent = 'not_txn' | 'expense' | 'income'

export interface Transaction {
  id: string
  amount: number
  merchant: string
  bankName: string
  transactionDate: number
  message: SMSMessage
  patternId?: number
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
  groupingTemplate: string
  occurrences: number
  transactions: Transaction[]
  patternType: PatternTypeType
  status: PatternStatusType
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
