import type { SMSMessage, Transaction, TransactionPattern } from '@/types/sms/transaction'
import { removeDuplicates } from '@/utils/formatter/remove-duplicated'
import { findDistinctPatterns } from '@/utils/pattern/find-distinct-pattern'
import { isTransactionalSender } from '@/utils/sms/is-transactional-sender'
import { SMSDataExtractor } from './sms-data-extractor-service'
import { SMSIntentService } from './sms-intent-service'
import { SMSPermissionService } from './sms-permission-service'
import { SMSReaderService } from './sms-reader-service'

export interface TransactionResult {
  success: boolean
  transactions: Transaction[]
  totalSMSRead: number
  totalTransactions: number
  errors: string[]
}
export interface TransactionSMSResult {
  success: boolean
  sms: SMSMessage[]
  totalSMSRead: number
  filteredSMSCount: number
  errors: string[]
}

export class SMSService {
  static async getTransactionalSMS(options: {
    startTimestamp: number
    endTimestamp: number
  }): Promise<TransactionSMSResult> {
    const { startTimestamp, endTimestamp } = options

    try {
      // Step 1: Check and request SMS permission
      const permissionResult = await SMSPermissionService.requestPermissionWithExplanation()

      if (!permissionResult.granted) {
        return {
          success: false,
          sms: [],
          totalSMSRead: 0,
          filteredSMSCount: 0,
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
          sms: [],
          totalSMSRead: 0,
          filteredSMSCount: 0,
          errors: [smsReadResult.error || 'Failed to read SMS messages'],
        }
      }

      // Step 3: Pre-filter to transactional/service SMS (format: XXXXXX-[TS])
      const transactionalMessages = (smsReadResult.messages || []).filter((sms) => isTransactionalSender(sms.address))
      return {
        success: true,
        sms: transactionalMessages,
        totalSMSRead: smsReadResult.totalCount,
        filteredSMSCount: transactionalMessages.length,
        errors: [],
      }
    } catch (error) {
      return {
        success: false,
        sms: [],
        totalSMSRead: 0,
        filteredSMSCount: 0,
        errors: [`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }
  static async getTransactionsFromSMS(options: {
    startTimestamp: number
    endTimestamp: number
  }): Promise<TransactionResult> {
    const { startTimestamp, endTimestamp } = options

    try {
      const smsReadResult = await this.getTransactionalSMS({ startTimestamp, endTimestamp })

      if (!smsReadResult.success) {
        return {
          success: false,
          transactions: [],
          totalSMSRead: 0,
          totalTransactions: 0,
          errors: smsReadResult.errors,
        }
      }

      // Process SMS messages using data extractor
      const transactions: Transaction[] = []
      const errors: string[] = []
      const SMSIntent = SMSIntentService.getInstance()

      await SMSIntent.init()

      const dataExtractor = SMSDataExtractor

      for (const sms of smsReadResult.sms || []) {
        try {
          const intentResult = await SMSIntent.classify(sms.body)

          if (intentResult.label === 'not_txn') {
            continue
          }

          const extractedData = dataExtractor.extract(sms.body, intentResult.label)

          // Only process if we have a valid amount
          if (extractedData.amount && extractedData.amount.value > 0) {
            const transaction: Transaction = {
              id: sms.id,
              amount: extractedData.amount.value,
              merchant: extractedData.merchant || 'Unknown',
              bankName: extractedData.bank?.name || 'Unknown',
              transactionDate: sms.date,
              message: sms,
            }

            transactions.push(transaction)
          }
        } catch (error) {
          errors.push(`Error processing SMS ${sms.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      return {
        success: true,
        transactions,
        totalSMSRead: smsReadResult.filteredSMSCount,
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

  static async processSMSMessagesLastNDays(days: number): Promise<TransactionResult> {
    const timestampRange = SMSReaderService.createLastNDaysRange(days)

    return await this.getTransactionsFromSMS({
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
}
