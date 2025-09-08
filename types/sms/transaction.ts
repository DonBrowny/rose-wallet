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
}

export interface SMSMessage {
  id: string
  body: string
  address: string // sender number
  date: number // timestamp
  read: boolean
}
