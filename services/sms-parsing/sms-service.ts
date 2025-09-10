import { DistinctPattern, ParsedTransaction, PatternRecognitionResult } from '@/types/sms/transaction'
import { stringSimilarity } from 'string-similarity-js'
import { SMSDataExtractorService } from './sms-data-extractor-service'
import { SMSIntentService } from './sms-intent-service'
import { PermissionResult, SMSPermissionService } from './sms-permission-service'
import { SMSReaderService } from './sms-reader-service'

export interface SMSProcessingResult {
  success: boolean
  transactions: ParsedTransaction[]
  distinctPatterns: DistinctPattern[]
  totalSMSRead: number
  totalPatterns: number
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
    const { startTimestamp, endTimestamp } = options

    try {
      // Step 1: Check and request SMS permission
      const permissionResult = await SMSPermissionService.requestPermissionWithExplanation()

      if (!permissionResult.granted) {
        return {
          success: false,
          transactions: [],
          distinctPatterns: [],
          totalSMSRead: 0,
          totalPatterns: 0,
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
          distinctPatterns: [],
          totalSMSRead: 0,
          totalPatterns: 0,
          errors: [smsReadResult.error || 'Failed to read SMS messages'],
          permissionResult,
        }
      }

      // Step 3: Process SMS messages using data extractor
      const transactions: ParsedTransaction[] = []
      const errors: string[] = []

      // Initialize intent service
      const SMSIntent = await SMSIntentService.getInstance()
      await SMSIntent.init()

      for (const sms of smsReadResult.messages || []) {
        try {
          // Classify SMS intent
          const intentResult = await SMSIntent.classify(sms.body)

          // Skip non-transaction messages
          if (intentResult.label === 'not_txn') {
            continue
          }

          // Extract transaction data using data extractor service
          const extractedData = SMSDataExtractorService.getInstance().extract(sms.body, intentResult.label)

          // Create parsed transaction
          const transaction: ParsedTransaction = {
            id: `${sms.id}_${Date.now()}`,
            amount: extractedData.amount?.value || 0,
            merchant: extractedData.merchant || 'Unknown',
            transactionType: mapIntentToTransactionType(intentResult.label),
            bankName: extractedData.bank?.name || 'Unknown',
            accountNumber: extractAccountNumber(sms.body),
            transactionDate: parseDate(extractedData.datetimeText) || new Date(sms.date),
            rawSms: sms.body,
            isDuplicate: false, // Will be set during deduplication
            category: extractedData.channel?.type || 'unknown',
            balance: extractedData.balance?.value,
            referenceNo: extractedData.referenceId,
            message: sms,
          }

          transactions.push(transaction)
        } catch (error) {
          errors.push(`Error processing SMS ${sms.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Remove duplicates
      const uniqueTransactions = removeDuplicates(transactions)

      // Find distinct patterns
      const distinctPatterns = findDistinctPatterns(uniqueTransactions)

      return {
        success: true,
        transactions: uniqueTransactions,
        distinctPatterns,
        totalSMSRead: smsReadResult.totalCount,
        totalPatterns: distinctPatterns.length,
        errors,
        permissionResult,
      }
    } catch (error) {
      return {
        success: false,
        transactions: [],
        distinctPatterns: [],
        totalSMSRead: 0,
        totalPatterns: 0,
        errors: [`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
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

  /**
   * Get distinct SMS message patterns from the last N days
   */
  static async getDistinctSMSMessagesLastNDays(days: number = 30): Promise<PatternRecognitionResult> {
    const result = await this.processSMSMessagesLastNDays(days)

    return {
      success: result.success,
      distinctPatterns: result.distinctPatterns,
      totalSMSRead: result.totalSMSRead,
      totalPatterns: result.totalPatterns,
      errors: result.errors,
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
    totalSMS: number
    totalTransactions: number
    totalPatterns: number
  } {
    const successRate = result.totalSMSRead > 0 ? (result.transactions.length / result.totalSMSRead) * 100 : 0

    return {
      successRate: Math.round(successRate * 100) / 100,
      duplicateRate: 0, // We handle duplicates differently now
      errorCount: result.errors.length,
      totalSMS: result.totalSMSRead,
      totalTransactions: result.transactions.length,
      totalPatterns: result.totalPatterns,
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
    // Ensure we have a valid date
    const transactionDate =
      transaction.transactionDate instanceof Date ? transaction.transactionDate : new Date(transaction.transactionDate)

    return {
      amount: `₹${transaction.amount.toFixed(2)}`,
      merchant: transaction.merchant,
      date: transactionDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      bank: transaction.bankName,
      category: transaction.category || 'Other',
      isDuplicate: transaction.isDuplicate || false,
    }
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

function extractAccountNumber(smsBody: string): string {
  // Look for patterns like A/C X0606, Account XX1234, etc.
  const accountMatch = smsBody.match(/A\/C\s+([A-Z0-9]+)|Account\s+([A-Z0-9]+)|A\/c\s+([A-Z0-9]+)/i)
  if (accountMatch) {
    return accountMatch[1] || accountMatch[2] || accountMatch[3] || ''
  }
  return ''
}

function parseDate(dateText?: string): Date | null {
  if (!dateText) return null

  // Try common date formats
  const formats = [
    /(\d{1,2})[\/\-](\w{3,9})[\/\-]?(\d{2,4})/i, // 07Jul25, 07/Jul/25
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i, // 07/07/25, 07-07-25
  ]

  for (const format of formats) {
    const match = dateText.match(format)
    if (match) {
      try {
        const day = parseInt(match[1])
        const month = match[2]
        const year = parseInt(match[3])

        // Handle 2-digit years
        const fullYear = year < 100 ? 2000 + year : year

        // Parse month
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        const monthIndex = monthNames.findIndex((m) => m.toLowerCase() === month.toLowerCase())
        const monthNum = monthIndex >= 0 ? monthIndex : parseInt(month) - 1

        return new Date(fullYear, monthNum, day)
      } catch {
        continue
      }
    }
  }

  return null
}

function removeDuplicates(transactions: ParsedTransaction[]): ParsedTransaction[] {
  const seen = new Set<string>()
  return transactions.filter((transaction) => {
    // Use raw SMS as the primary key for deduplication
    const key = transaction.rawSms
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function findDistinctPatterns(transactions: ParsedTransaction[]): DistinctPattern[] {
  const patterns: DistinctPattern[] = []
  const processedTransactions = new Set<string>()

  for (const transaction of transactions) {
    // Skip if this transaction is already processed
    if (processedTransactions.has(transaction.id)) {
      continue
    }

    const template = normalizeSMSTemplate(transaction.rawSms)

    // Find all transactions with similar templates
    const similarTransactions = transactions.filter((t) => {
      if (processedTransactions.has(t.id)) {
        return false // Skip already processed transactions
      }
      const similarity = stringSimilarity(template, normalizeSMSTemplate(t.rawSms))
      return similarity >= 0.8 // 80% similarity threshold
    })

    if (similarTransactions.length > 0) {
      // Mark all similar transactions as processed
      similarTransactions.forEach((t) => processedTransactions.add(t.id))

      const pattern: DistinctPattern = {
        id: `pattern_${patterns.length + 1}`,
        template,
        patternType: determinePatternType(transaction.rawSms),
        occurrences: similarTransactions.length,
        confidence: calculatePatternConfidence(similarTransactions),
        transactions: similarTransactions,
        sampleSMS: transaction.rawSms,
        variableFields: extractVariableFields(transaction.rawSms),
      }

      patterns.push(pattern)
    }
  }

  return patterns.sort((a, b) => b.occurrences - a.occurrences)
}

function normalizeSMSTemplate(sms: string): string {
  return sms
    .replace(/\b\d+\.?\d*\b/g, 'AMOUNT') // Replace amounts
    .replace(/\b\d{1,2}[\/\-]\w{3,9}[\/\-]?\d{0,4}\b/g, 'DATE') // Replace dates
    .replace(/\b[A-Z]{2,}\b/g, 'MERCHANT') // Replace merchant names
    .replace(/\b[A-Z0-9]{10,}\b/g, 'REFERENCE') // Replace reference numbers
    .replace(/\b\d{4,}\b/g, 'ACCOUNT') // Replace account numbers
    .replace(/\b\d{10,}\b/g, 'PHONE') // Replace phone numbers
    .trim()
}

function determinePatternType(sms: string): string {
  const upperSms = sms.toUpperCase()

  if (upperSms.includes('UPI')) return 'UPI_TRANSACTION'
  if (upperSms.includes('CARD')) return 'CARD_TRANSACTION'
  if (upperSms.includes('ATM')) return 'ATM_TRANSACTION'
  if (upperSms.includes('IMPS')) return 'IMPS_TRANSACTION'
  if (upperSms.includes('NEFT')) return 'NEFT_TRANSACTION'
  if (upperSms.includes('RTGS')) return 'RTGS_TRANSACTION'
  if (upperSms.includes('EMI')) return 'EMI_TRANSACTION'
  if (upperSms.includes('SIP')) return 'SIP_TRANSACTION'

  return 'GENERAL_TRANSACTION'
}

function calculatePatternConfidence(transactions: ParsedTransaction[]): number {
  if (transactions.length <= 1) return 0.5

  const template = normalizeSMSTemplate(transactions[0].rawSms)
  const similarities = transactions.map((t) => stringSimilarity(template, normalizeSMSTemplate(t.rawSms)))

  const avgSimilarity = similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length
  return Math.min(0.95, Math.max(0.5, avgSimilarity))
}

function extractVariableFields(sms: string): string[] {
  const fields: string[] = []

  // Extract amounts
  const amounts = sms.match(/\b\d+\.?\d*\b/g)
  if (amounts) fields.push(...amounts)

  // Extract dates
  const dates = sms.match(/\b\d{1,2}[\/\-]\w{3,9}[\/\-]?\d{0,4}\b/g)
  if (dates) fields.push(...dates)

  // Extract merchant names (uppercase words)
  const merchants = sms.match(/\b[A-Z]{2,}\b/g)
  if (merchants) fields.push(...merchants)

  // Extract reference numbers
  const refs = sms.match(/\b[A-Z0-9]{10,}\b/g)
  if (refs) fields.push(...refs)

  return [...new Set(fields)] // Remove duplicates
}
