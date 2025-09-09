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
}

export class SMSService {
  private static _instance: SMSService | null = null

  static getInstance(): SMSService {
    if (!SMSService._instance) {
      SMSService._instance = new SMSService()
    }
    return SMSService._instance
  }

  private constructor() {}

  /**
   * Process SMS messages from the last N days and extract distinct patterns
   */
  async processSMSMessages(days: number = 30): Promise<SMSProcessingResult> {
    try {
      // Check SMS permissions
      const permissionResult: PermissionResult = await SMSPermissionService.checkPermission()
      if (!permissionResult.granted) {
        return {
          success: false,
          transactions: [],
          distinctPatterns: [],
          totalSMSRead: 0,
          totalPatterns: 0,
          errors: [`SMS permissions not granted: ${permissionResult.message}`],
        }
      }

      // Read SMS messages
      const smsReadResult = await SMSReaderService.readSMS({
        startTimestamp: Date.now() - days * 24 * 60 * 60 * 1000,
        endTimestamp: Date.now(),
      })
      if (!smsReadResult.success) {
        return {
          success: false,
          transactions: [],
          distinctPatterns: [],
          totalSMSRead: 0,
          totalPatterns: 0,
          errors: smsReadResult.error ? [smsReadResult.error] : ['Failed to read SMS messages'],
        }
      }

      // Initialize intent service
      const SMSIntent = await SMSIntentService.getInstance()
      await SMSIntent.init()

      // Process each SMS message
      const transactions: ParsedTransaction[] = []
      const errors: string[] = []

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
            transactionType: this.mapIntentToTransactionType(intentResult.label),
            bankName: extractedData.bank?.name || 'Unknown',
            accountNumber: this.extractAccountNumber(sms.body),
            transactionDate: this.parseDate(extractedData.datetimeText) || new Date(sms.date),
            rawSms: sms.body,
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
      const uniqueTransactions = this.removeDuplicates(transactions)

      // Find distinct patterns
      const distinctPatterns = this.findDistinctPatterns(uniqueTransactions)

      return {
        success: true,
        transactions: uniqueTransactions,
        distinctPatterns,
        totalSMSRead: smsReadResult.messages?.length || 0,
        totalPatterns: distinctPatterns.length,
        errors,
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
   * Get distinct SMS message patterns from the last N days
   */
  async getDistinctSMSMessagesLastNDays(days: number = 30): Promise<PatternRecognitionResult> {
    const result = await this.processSMSMessages(days)

    return {
      success: result.success,
      distinctPatterns: result.distinctPatterns,
      totalSMSRead: result.totalSMSRead,
      totalPatterns: result.totalPatterns,
      errors: result.errors,
    }
  }

  /**
   * Find distinct patterns in SMS messages
   */
  private findDistinctPatterns(transactions: ParsedTransaction[]): DistinctPattern[] {
    const patterns: DistinctPattern[] = []
    const processedTransactions = new Set<string>()

    for (const transaction of transactions) {
      // Skip if this transaction is already processed
      if (processedTransactions.has(transaction.id)) {
        continue
      }

      const template = this.normalizeSMSTemplate(transaction.rawSms)

      // Find all transactions with similar templates
      const similarTransactions = transactions.filter((t) => {
        if (processedTransactions.has(t.id)) {
          return false // Skip already processed transactions
        }
        const similarity = stringSimilarity(template, this.normalizeSMSTemplate(t.rawSms))
        return similarity >= 0.8 // 80% similarity threshold
      })

      if (similarTransactions.length > 0) {
        // Mark all similar transactions as processed
        similarTransactions.forEach((t) => processedTransactions.add(t.id))

        const pattern: DistinctPattern = {
          id: `pattern_${patterns.length + 1}`,
          template,
          patternType: this.determinePatternType(transaction.rawSms),
          occurrences: similarTransactions.length,
          confidence: this.calculatePatternConfidence(similarTransactions),
          transactions: similarTransactions,
          sampleSMS: transaction.rawSms,
          variableFields: this.extractVariableFields(transaction.rawSms),
        }

        patterns.push(pattern)
      }
    }

    return patterns.sort((a, b) => b.occurrences - a.occurrences)
  }

  /**
   * Normalize SMS template by replacing variable parts with placeholders
   */
  private normalizeSMSTemplate(sms: string): string {
    return sms
      .replace(/\b\d+\.?\d*\b/g, 'AMOUNT') // Replace amounts
      .replace(/\b\d{1,2}[\/\-]\w{3,9}[\/\-]?\d{0,4}\b/g, 'DATE') // Replace dates
      .replace(/\b[A-Z]{2,}\b/g, 'MERCHANT') // Replace merchant names
      .replace(/\b[A-Z0-9]{10,}\b/g, 'REFERENCE') // Replace reference numbers
      .replace(/\b\d{4,}\b/g, 'ACCOUNT') // Replace account numbers
      .replace(/\b\d{10,}\b/g, 'PHONE') // Replace phone numbers
      .trim()
  }

  /**
   * Determine pattern type based on SMS content
   */
  private determinePatternType(sms: string): string {
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

  /**
   * Calculate pattern confidence based on transaction similarity
   */
  private calculatePatternConfidence(transactions: ParsedTransaction[]): number {
    if (transactions.length <= 1) return 0.5

    const template = this.normalizeSMSTemplate(transactions[0].rawSms)
    const similarities = transactions.map((t) => stringSimilarity(template, this.normalizeSMSTemplate(t.rawSms)))

    const avgSimilarity = similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length
    return Math.min(0.95, Math.max(0.5, avgSimilarity))
  }

  /**
   * Remove duplicate transactions
   */
  private removeDuplicates(transactions: ParsedTransaction[]): ParsedTransaction[] {
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

  /**
   * Map intent label to transaction type
   */
  private mapIntentToTransactionType(intent: string): 'debit' | 'credit' {
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

  /**
   * Extract account number from SMS body
   */
  private extractAccountNumber(smsBody: string): string {
    // Look for patterns like A/C X0606, Account XX1234, etc.
    const accountMatch = smsBody.match(/A\/C\s+([A-Z0-9]+)|Account\s+([A-Z0-9]+)|A\/c\s+([A-Z0-9]+)/i)
    if (accountMatch) {
      return accountMatch[1] || accountMatch[2] || accountMatch[3] || ''
    }
    return ''
  }

  /**
   * Extract variable fields from SMS
   */
  private extractVariableFields(sms: string): string[] {
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

  /**
   * Parse date from various formats
   */
  private parseDate(dateText?: string): Date | null {
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
}
