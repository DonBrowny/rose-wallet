import { Platform } from 'react-native'
import { readSMS as expoReadSMS, isAvailable, type SMSMessage, type SMSReadOptions } from 'rose-sms-reader'

export interface SMSReadResult {
  success: boolean
  messages: SMSMessage[]
  error?: string
  totalCount: number
}

export class SMSReaderService {
  static async isReaderAvailable(): Promise<boolean> {
    if (Platform.OS !== 'android') return false
    return await isAvailable()
  }

  static async readSMS(options: SMSReadOptions): Promise<SMSReadResult> {
    const { startTimestamp, endTimestamp, senderNumbers = [] } = options

    if (!(await this.isReaderAvailable())) {
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
      const messages =
        result.messages?.map((message) => ({
          ...message,
          body: message.body.trim(),
        })) || []

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
