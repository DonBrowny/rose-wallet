import type { PatternStatus, TransactionType } from '@/db/schema'
import type { SMSMessage } from 'rose-sms-reader'

export type { SMSMessage } from 'rose-sms-reader'

/** @deprecated only sms-data-extractor still speaks this — use TransactionType from '@/db/schema' */
export type Intent = 'not_txn' | 'expense' | 'income'

/** @deprecated legacy pipeline shape — use ExtractedTxn from '@/types/sms-parsing' */
export interface Transaction {
  id: string
  amount: number
  merchant: string
  bankName: string
  transactionDate: number
  message: SMSMessage
  patternId?: number
}

/** @deprecated legacy pipeline shape — use PatternDraft from '@/types/sms-parsing' */
export interface DistinctPattern {
  id: string
  template: string
  groupingTemplate: string
  occurrences: number
  transactions: Transaction[]
  patternType: TransactionType
  status: PatternStatus
}
