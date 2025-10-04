export interface SMSMessage {
  id: string
  body: string
  address: string
  date: number
  read: boolean
  type: number // 1 = Inbox, 2 = Sent
}

export interface SMSReadOptions {
  startTimestamp: number
  endTimestamp: number
  senderNumbers?: string[]
  includeRead?: boolean
}

export interface SMSReadResult {
  messages: SMSMessage[]
}

export interface PermissionResult {
  granted: boolean
  canAskAgain: boolean
  message: string
}

export type RoseSmsReaderModuleEvents = Record<string, never>
