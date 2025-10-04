import type { SMSMessage } from 'rose-sms-reader'

export interface SMSReadOptions {
  startTimestamp: number
  endTimestamp: number
  senderNumbers?: string[]
  includeRead?: boolean
}

export interface SMSReadResult {
  success: boolean
  messages: SMSMessage[]
  error?: string
  totalCount: number
}
