import { PermissionResult } from '@/services/sms-parsing/sms-permission-service'

export interface ParsedTransaction {
  id: string
  amount: number
  merchant: string
  transactionType: 'debit' | 'credit'
  bankName: string
  accountNumber: string // masked
  transactionDate: Date
  rawSms: string
  isDuplicate?: boolean
  category?: string
  balance?: number
  referenceNo?: string
  message: SMSMessage
}

export interface SMSMessage {
  id: string
  body: string
  address: string // sender number
  date: number // timestamp
  read: boolean
}

export interface DistinctPattern {
  id: string
  template: string // normalized template with placeholders
  sampleSMS: string // first occurrence of this pattern
  occurrences: number // how many SMS match this pattern
  transactions: ParsedTransaction[] // all transactions with this pattern
  patternType: string // UPI_DEBIT, UPI_CREDIT, CARD_TRANSACTION, etc.
  confidence: number // similarity confidence score
  variableFields: string[] // detected variable fields like [AMOUNT], [DATE], etc.
}

export interface PatternRecognitionResult {
  success: boolean
  distinctPatterns: DistinctPattern[]
  totalSMSRead: number
  totalPatterns: number
  errors: string[]
  permissionResult?: PermissionResult
}
