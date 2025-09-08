import { SMSMessage } from '@/types/sms/transaction'
import * as SMS from 'expo-sms'
import { Platform } from 'react-native'

export interface SMSReadOptions {
  daysBack?: number
  senderNumbers?: string[]
  includeRead?: boolean
}

export interface SMSReadResult {
  success: boolean
  messages: SMSMessage[]
  error?: string
  totalCount: number
}

export class SMSReaderService {
  /**
   * Check if SMS reading is available on this platform
   */
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'android') return false
    return await SMS.isAvailableAsync()
  }

  /**
   * Read SMS messages from device
   * Note: This is a simplified implementation for prototype
   * In a real app, you'd need to use react-native-sms-android or similar
   */
  static async readSMS(options: SMSReadOptions = {}): Promise<SMSReadResult> {
    const { daysBack = 15, senderNumbers = [] } = options

    if (!(await this.isAvailable())) {
      return {
        success: false,
        messages: [],
        error: 'SMS reading is not available on this platform',
        totalCount: 0,
      }
    }

    try {
      // For prototype purposes, we'll simulate SMS reading
      // In a real implementation, you'd use react-native-sms-android
      const mockMessages = this.generateMockSMSMessages(daysBack, senderNumbers)

      return {
        success: true,
        messages: mockMessages,
        totalCount: mockMessages.length,
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
   * Generate mock SMS messages for prototype testing
   * This simulates real bank SMS messages
   */
  private static generateMockSMSMessages(daysBack: number, senderNumbers: string[]): SMSMessage[] {
    const messages: SMSMessage[] = []
    const now = new Date()

    // Mock bank SMS messages
    const mockSMSData = [
      {
        sender: 'HDFCBK',
        body: 'Rs.500.00 debited from A/c **1234 on 15-Dec-24 at 14:30. Avl Bal Rs.25,000.00',
        daysAgo: 1,
      },
      {
        sender: 'HDFCBK',
        body: 'Rs.150.00 paid to SWIGGY via UPI. UPI Ref: 123456789012. Avl Bal Rs.24,850.00',
        daysAgo: 2,
      },
      {
        sender: 'ICICIB',
        body: 'Rs.2000.00 transferred to JOHN DOE via NEFT. Ref: NEFT123456789. Avl Bal Rs.22,850.00',
        daysAgo: 3,
      },
      {
        sender: 'GPAY',
        body: 'Rs.75.00 paid to UBER via UPI. UPI Ref: 987654321098. Avl Bal Rs.22,775.00',
        daysAgo: 4,
      },
      {
        sender: 'HDFCBK',
        body: 'Rs.1200.00 spent on AMAZON on 12/12/24 at 16:45. Avl Bal Rs.21,575.00',
        daysAgo: 5,
      },
      {
        sender: 'SBI',
        body: 'Rs.300.00 debited from A/c 1234567890 on 11-Dec-24 at 10:15. Avl Bal Rs.21,275.00',
        daysAgo: 6,
      },
      {
        sender: 'PHONEPE',
        body: 'Rs.250.00 paid to ZOMATO via UPI. UPI Ref: 112233445566. Avl Bal Rs.21,025.00',
        daysAgo: 7,
      },
      {
        sender: 'AXISB',
        body: 'Rs.800.00 spent on FLIPKART on 09/12/24 at 20:30. Avl Bal Rs.20,225.00',
        daysAgo: 8,
      },
      {
        sender: 'HDFCBK',
        body: 'Rs.450.00 debited from A/c **1234 on 08-Dec-24 at 12:00. Avl Bal Rs.19,775.00',
        daysAgo: 9,
      },
      {
        sender: 'KOTAK',
        body: 'Rs.1800.00 transferred to RENT PAYMENT via NEFT. Ref: NEFT987654321. Avl Bal Rs.17,975.00',
        daysAgo: 10,
      },
    ]

    mockSMSData.forEach((sms, index) => {
      const messageDate = new Date(now)
      messageDate.setDate(messageDate.getDate() - sms.daysAgo)

      messages.push({
        id: `mock_sms_${index}`,
        body: sms.body,
        address: sms.sender,
        date: messageDate.getTime(),
        read: true,
      })
    })

    return messages
  }

  /**
   * Filter SMS messages by date range
   */
  static filterMessagesByDate(messages: SMSMessage[], daysBack: number): SMSMessage[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBack)

    return messages.filter((message) => {
      const messageDate = new Date(message.date)
      return messageDate >= cutoffDate
    })
  }

  /**
   * Filter SMS messages by sender numbers
   */
  static filterMessagesBySender(messages: SMSMessage[], senderNumbers: string[]): SMSMessage[] {
    if (senderNumbers.length === 0) {
      return messages
    }

    return messages.filter((message) =>
      senderNumbers.some((sender) => message.address.toUpperCase().includes(sender.toUpperCase()))
    )
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
}
