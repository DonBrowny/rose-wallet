import { isAvailable as expoIsAvailable, readSMS as expoReadSMS } from 'expo-sms-reader'
import { Platform } from 'react-native'

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

export interface SMSMessage {
  id: string
  body: string
  address: string
  date: number
  read: boolean
  type: number // 1 = Inbox, 2 = Sent
}

export class SMSReaderService {
  /**
   * Check if SMS reading is available on this platform
   */
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'android') return false
    return await expoIsAvailable()
  }

  /**
   * Read SMS messages from device using our custom Expo module
   */
  static async readSMS(options: SMSReadOptions): Promise<SMSReadResult> {
    const { startTimestamp, endTimestamp, senderNumbers = [] } = options

    if (!(await this.isAvailable())) {
      return {
        success: false,
        messages: [],
        error: 'SMS reading is not available on this platform',
        totalCount: 0,
      }
    }

    try {
      const result = await expoReadSMS({
        startTimestamp,
        endTimestamp,
        senderNumbers,
        includeRead: true,
      })

      // The native module returns { messages: [...] }
      const messages = result.messages || []

      return {
        success: true,
        messages: messages,
        totalCount: messages.length,
        error: undefined,
      }
    } catch (error) {
      return {
        success: false,
        messages: [],
        error: `Failed to read SMS: ${error}`,
        totalCount: 0,
      }
    }
  }

  /**
   * Get all unique sender numbers from messages
   */
  static getUniqueSenders(messages: SMSMessage[]): string[] {
    const senders = new Set<string>()
    messages.forEach((message) => {
      senders.add(message.address)
    })
    return Array.from(senders)
  }

  /**
   * Create timestamp range for the last N days
   */
  static createLastNDaysRange(days: number): { startTimestamp: number; endTimestamp: number } {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    return {
      startTimestamp: startDate.getTime(),
      endTimestamp: endDate.getTime(),
    }
  }
}
