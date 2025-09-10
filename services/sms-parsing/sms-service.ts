import type { Transaction, TransactionPattern } from '@/types/sms/transaction'
import { parseDate } from '@/utils/formatter/parse-date'
import { findDistinctPatterns } from '@/utils/pattern/find-distinct-pattern'
import { SMSDataExtractorService } from './sms-data-extractor-service'
import { SMSIntentService } from './sms-intent-service'
import { PermissionResult, SMSPermissionService } from './sms-permission-service'
import { SMSReaderService } from './sms-reader-service'

export interface TransactionResult {
  success: boolean
  transactions: Transaction[]
  totalSMSRead: number
  totalTransactions: number
  errors: string[]
}

export interface SMSProcessingOptions {
  startTimestamp: number
  endTimestamp: number
  includeDuplicates?: boolean
  patterns?: any[]
}

export class SMSService {
  static async getTransactionsFromSMS(options: SMSProcessingOptions): Promise<TransactionResult> {
    const { startTimestamp, endTimestamp } = options

    try {
      // Step 1: Check and request SMS permission
      const permissionResult = await SMSPermissionService.requestPermissionWithExplanation()

      if (!permissionResult.granted) {
        return {
          success: false,
          transactions: [],
          totalSMSRead: 0,
          totalTransactions: 0,
          errors: [permissionResult.message],
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
          totalTransactions: 0,
          errors: [smsReadResult.error || 'Failed to read SMS messages'],
        }
      }

      // Step 3: Process SMS messages using data extractor
      const transactions: Transaction[] = []
      const errors: string[] = []
      const SMSIntent = await SMSIntentService.getInstance()

      await SMSIntent.init()

      for (const sms of smsReadResult.messages || []) {
        try {
          const intentResult = await SMSIntent.classify(sms.body)

          if (intentResult.label === 'not_txn') {
            continue
          }

          const extractedData = SMSDataExtractorService.getInstance().extract(sms.body, intentResult.label)

          const transaction = {
            id: sms.id,
            amount: extractedData.amount?.value || 0,
            merchant: extractedData.merchant || 'Unknown',
            transactionType: mapIntentToTransactionType(intentResult.label),
            bankName: extractedData.bank?.name || 'Unknown',
            transactionDate: parseDate(extractedData.datetimeText) || new Date(sms.date),
            category: extractedData.channel?.type || 'unknown',
            message: sms,
          }

          transactions.push(transaction)
        } catch (error) {
          errors.push(`Error processing SMS ${sms.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      return {
        success: true,
        transactions,
        totalSMSRead: smsReadResult.totalCount,
        totalTransactions: transactions.length,
        errors,
      }
    } catch (error) {
      return {
        success: false,
        transactions: [],
        totalSMSRead: 0,
        totalTransactions: 0,
        errors: [`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }

  static async getTransactionPatterns(transactionResult: TransactionResult): Promise<TransactionPattern> {
    const { transactions, totalSMSRead, totalTransactions, errors } = transactionResult

    try {
      const uniqueTransactions = removeDuplicates(transactions)

      const distinctPatterns = findDistinctPatterns(uniqueTransactions)

      return {
        success: true,
        transactions: uniqueTransactions,
        distinctPatterns,
        totalSMSRead,
        totalTransactions,
        totalPatterns: distinctPatterns.length,
        errors,
      }
    } catch (error) {
      return {
        success: false,
        transactions: [],
        distinctPatterns: [],
        totalSMSRead: 0,
        totalTransactions: 0,
        totalPatterns: 0,
        errors: [`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }

  static async processSMSMessagesLastNDays(
    days: number,
    options: Omit<SMSProcessingOptions, 'startTimestamp' | 'endTimestamp'> = {}
  ): Promise<TransactionResult> {
    const timestampRange = SMSReaderService.createLastNDaysRange(days)

    return await this.getTransactionsFromSMS({
      ...options,
      startTimestamp: timestampRange.startTimestamp,
      endTimestamp: timestampRange.endTimestamp,
    })
  }

  /**
   * Get distinct SMS message patterns from the last N days
   */
  static async getDistinctSMSMessagesLastNDays(days: number = 30): Promise<TransactionPattern> {
    const result = await this.processSMSMessagesLastNDays(days)
    const transactionPatterns = await this.getTransactionPatterns(result)

    return transactionPatterns
  }

  /**
   * Check SMS permission status without requesting
   */
  static async checkPermissionStatus(): Promise<PermissionResult> {
    return await SMSPermissionService.checkPermission()
  }
}

// Helper functions
function mapIntentToTransactionType(intent: string): 'debit' | 'credit' {
  switch (intent) {
    case 'expense':
      return 'debit'
    case 'income':
      return 'credit'
    case 'future_payments':
      return 'debit' // Future payments are typically debits
    default:
      return 'debit'
  }
}

function removeDuplicates(transactions: Transaction[]): Transaction[] {
  const seen = new Set<string>()
  return transactions.filter((transaction) => {
    // Use raw SMS as the primary key for deduplication
    const key = transaction.message.body
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}
