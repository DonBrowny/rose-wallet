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
}

export interface SMSMessage {
  id: string
  body: string
  address: string // sender number
  date: number // timestamp
  read: boolean
}

export interface BankPattern {
  bankName: string
  senderNumbers: string[]
  patterns: {
    name: string
    regex: RegExp
    fields: {
      amount: string
      merchant: string
      date: string
      account: string
      balance?: string
    }
  }[]
}

export interface SMSParseResult {
  success: boolean
  transaction?: ParsedTransaction
  error?: string
  matchedPattern?: string
}
