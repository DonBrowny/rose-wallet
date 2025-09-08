import { ParsedTransaction } from '@/types/sms/transaction'
import { SMSParserService } from './sms-parser-service'
import { PermissionResult, SMSPermissionService } from './sms-permission-service'
import { SMSReaderService } from './sms-reader-service'

export interface SMSProcessingResult {
  success: boolean
  transactions: ParsedTransaction[]
  totalSMSRead: number
  totalTransactionsParsed: number
  duplicatesFound: number
  errors: string[]
  permissionResult?: PermissionResult
}

export interface SMSProcessingOptions {
  startTimestamp: number
  endTimestamp: number
  includeDuplicates?: boolean
  patterns?: any[]
}

export class SMSService {
  /**
   * Main method to process SMS messages and extract transactions
   */
  static async processSMSMessages(options: SMSProcessingOptions): Promise<SMSProcessingResult> {
    const { startTimestamp, endTimestamp, includeDuplicates = true } = options

    try {
      // Step 1: Check and request SMS permission
      const permissionResult = await SMSPermissionService.requestPermissionWithExplanation()

      if (!permissionResult.granted) {
        return {
          success: false,
          transactions: [],
          totalSMSRead: 0,
          totalTransactionsParsed: 0,
          duplicatesFound: 0,
          errors: [permissionResult.message],
          permissionResult,
        }
      }

      // Step 2: Read SMS messages
      const smsReadResult = await SMSReaderService.readSMS({
        startTimestamp,
        endTimestamp,
        includeRead: true,
      })

      if (!smsReadResult.success) {
        return {
          success: false,
          transactions: [],
          totalSMSRead: 0,
          totalTransactionsParsed: 0,
          duplicatesFound: 0,
          errors: [smsReadResult.error || 'Failed to read SMS messages'],
          permissionResult,
        }
      }

      // Step 3: Parse SMS messages into transactions
      const parseResult = await SMSParserService.parseSMSMessages(smsReadResult.messages, { includeDuplicates })

      return {
        success: parseResult.success,
        transactions: parseResult.transactions,
        totalSMSRead: smsReadResult.totalCount,
        totalTransactionsParsed: parseResult.transactions.length,
        duplicatesFound: parseResult.duplicatesFound,
        errors: parseResult.errors,
        permissionResult,
      }
    } catch (error) {
      return {
        success: false,
        transactions: [],
        totalSMSRead: 0,
        totalTransactionsParsed: 0,
        duplicatesFound: 0,
        errors: [`Unexpected error: ${error}`],
      }
    }
  }

  /**
   * Check SMS permission status without requesting
   */
  static async checkPermissionStatus(): Promise<PermissionResult> {
    return await SMSPermissionService.checkPermission()
  }

  /**
   * Get processing statistics
   */
  static getProcessingStats(result: SMSProcessingResult): {
    successRate: number
    duplicateRate: number
    errorCount: number
  } {
    const successRate = result.totalSMSRead > 0 ? (result.totalTransactionsParsed / result.totalSMSRead) * 100 : 0

    const duplicateRate =
      result.totalTransactionsParsed > 0 ? (result.duplicatesFound / result.totalTransactionsParsed) * 100 : 0

    return {
      successRate: Math.round(successRate * 100) / 100,
      duplicateRate: Math.round(duplicateRate * 100) / 100,
      errorCount: result.errors.length,
    }
  }

  /**
   * Format transaction for display
   */
  static formatTransactionForDisplay(transaction: ParsedTransaction): {
    amount: string
    merchant: string
    date: string
    bank: string
    category: string
    isDuplicate: boolean
  } {
    return {
      amount: `₹${transaction.amount.toFixed(2)}`,
      merchant: transaction.merchant,
      date: transaction.transactionDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      bank: transaction.bankName,
      category: transaction.category || 'Other',
      isDuplicate: transaction.isDuplicate || false,
    }
  }

  /**
   * Process SMS messages for the last N days using timestamps
   */
  static async processSMSMessagesLastNDays(
    days: number,
    options: Omit<SMSProcessingOptions, 'startTimestamp' | 'endTimestamp'> = {}
  ): Promise<SMSProcessingResult> {
    const timestampRange = SMSReaderService.createLastNDaysRange(days)

    return await this.processSMSMessages({
      ...options,
      startTimestamp: timestampRange.startTimestamp,
      endTimestamp: timestampRange.endTimestamp,
    })
  }
}
