import { DistinctPattern, ParsedTransaction, PatternRecognitionResult } from '@/types/sms/transaction'
import { stringSimilarity } from 'string-similarity-js'
import { SMSIntent } from './sms-intent-service'
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
}

export class SMSAlternativeService {
  private static _instance: SMSAlternativeService | null = null

  static getInstance(): SMSAlternativeService {
    if (!SMSAlternativeService._instance) {
      SMSAlternativeService._instance = new SMSAlternativeService()
    }
    return SMSAlternativeService._instance
  }

  private constructor() {}

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
      // Initialize SMS Intent Service
      await SMSIntent.init()
      // Classify messages
      const results = await SMSIntent.classifyMany(smsReadResult)

      const filteredMessages = results.filter((m) => m.label === 'expense')

      console.log('filteredMessages', filteredMessages.length)

      // Step 3: Parse SMS messages into transactions
      const parseResult = await SMSParserService.parseSMSMessages(filteredMessages, { includeDuplicates })

      console.log('parseResult', parseResult)

      return {
        success: true,
        transactions: parseResult.transactions,
        totalSMSRead: smsReadResult.totalCount,
        totalTransactionsParsed: parseResult.transactions.length,
        duplicatesFound: parseResult.duplicatesFound,
        errors: parseResult.errors,
        permissionResult,
      }
    } catch (error) {
      console.log('❌ Error in processSMSMessages:', error)
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

  /**
   * Process SMS messages for the last N days using timestamps
   */
  static async getDistinctSMSMessagesLastNDays(
    days: number,
    options: Omit<SMSProcessingOptions, 'startTimestamp' | 'endTimestamp'> = {}
  ): Promise<PatternRecognitionResult> {
    const timestampRange = SMSReaderService.createLastNDaysRange(days)

    return await this.getDistinctMessagePatterns({
      ...options,
      startTimestamp: timestampRange.startTimestamp,
      endTimestamp: timestampRange.endTimestamp,
    })
  }

  /**
   * Get distinct message patterns from SMS messages
   */
  static async getDistinctMessagePatterns(options: SMSProcessingOptions): Promise<PatternRecognitionResult> {
    try {
      // Step 1: Call existing processSMSMessages to get all SMS and transactions
      const smsResult = await this.processSMSMessages(options)
      if (!smsResult.success) {
        return {
          success: false,
          distinctPatterns: [],
          totalSMSRead: smsResult.totalSMSRead,
          totalPatterns: 0,
          errors: smsResult.errors,
          permissionResult: smsResult.permissionResult,
        }
      }

      // Step 2: Extract raw SMS messages from transactions
      const rawMessages = smsResult.transactions.map((t) => t.rawSms)

      // Step 3: Identify distinct patterns
      const distinctPatterns = await this.identifyDistinctPatterns(rawMessages, smsResult.transactions)

      return {
        success: true,
        distinctPatterns,
        totalSMSRead: smsResult.totalSMSRead,
        totalPatterns: distinctPatterns.length,
        errors: smsResult.errors,
        permissionResult: smsResult.permissionResult,
      }
    } catch (error) {
      return {
        success: false,
        distinctPatterns: [],
        totalSMSRead: 0,
        totalPatterns: 0,
        errors: [`Unexpected error in pattern recognition: ${error}`],
      }
    }
  }

  /**
   * Identify distinct patterns from raw SMS messages
   */
  private static async identifyDistinctPatterns(
    rawMessages: string[],
    transactions: ParsedTransaction[]
  ): Promise<DistinctPattern[]> {
    const patterns: DistinctPattern[] = []
    const processedTemplates = new Map<string, DistinctPattern>()

    for (let i = 0; i < rawMessages.length; i++) {
      const sms = rawMessages[i]
      const transaction = transactions[i]

      // Step 1: Normalize SMS to template
      const template = this.normalizeSMSToTemplate(sms)
      const patternType = this.classifyPatternType(sms, template)

      // Step 2: Check if this template matches any existing pattern
      let matchedPattern: DistinctPattern | null = null
      let bestSimilarity = 0
      const SIMILARITY_THRESHOLD = 0.8

      for (const [templateKey, existingPattern] of processedTemplates) {
        const similarity = stringSimilarity(template, templateKey)

        if (similarity >= SIMILARITY_THRESHOLD && similarity > bestSimilarity) {
          bestSimilarity = similarity
          matchedPattern = existingPattern
        }
      }

      if (matchedPattern) {
        // Add to existing pattern
        matchedPattern.occurrences++
        matchedPattern.transactions.push(transaction)
        matchedPattern.confidence = Math.max(matchedPattern.confidence, bestSimilarity)
      } else {
        // Create new pattern
        const newPattern: DistinctPattern = {
          id: `pattern_${patterns.length + 1}`,
          template,
          sampleSMS: sms,
          occurrences: 1,
          transactions: [transaction],
          patternType,
          confidence: 1.0,
          variableFields: this.extractVariableFields(template),
        }

        patterns.push(newPattern)
        processedTemplates.set(template, newPattern)
      }
    }

    return patterns
  }

  /**
   * Normalize SMS message to template by replacing variable parts with placeholders
   */
  private static normalizeSMSToTemplate(sms: string): string {
    let template = sms

    // Replace amounts (including decimal amounts)
    template = template.replace(/\d+\.?\d*/g, '[AMOUNT]')

    // Replace dates (various formats)
    template = template.replace(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/g, '[DATE]')
    template = template.replace(/\d{2}[A-Za-z]{3}\d{2}/g, '[DATE]')
    template = template.replace(/\d{1,2}[A-Za-z]{3}\d{2,4}/g, '[DATE]')

    // Replace account numbers
    template = template.replace(/A\/C\s+\w+/g, 'A/C [ACCOUNT]')

    // Replace reference numbers
    template = template.replace(/Refno\s+\d+/g, 'Refno [REFNO]')
    template = template.replace(/Ref\s+\d+/g, 'Ref [REFNO]')

    // Replace phone numbers
    template = template.replace(/\d{10,}/g, '[PHONE]')

    // Replace merchant names (after "trf to" or similar)
    template = template.replace(/trf to [A-Z\s]+/g, 'trf to [MERCHANT]')
    template = template.replace(/to [A-Z\s]+/g, 'to [MERCHANT]')

    // Replace bank names (usually at the end)
    template = template.replace(/-\s*[A-Z]+$/g, '-[BANK]')

    // Replace UPI IDs
    template = template.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[UPI_ID]')

    // Replace transaction IDs
    template = template.replace(/Txn\s+\w+/g, 'Txn [TXN_ID]')
    template = template.replace(/TXN\s+\w+/g, 'TXN [TXN_ID]')

    return template
  }

  /**
   * Classify the pattern type based on SMS content
   */
  private static classifyPatternType(sms: string, template: string): string {
    const smsLower = sms.toLowerCase()

    if (smsLower.includes('upi') && smsLower.includes('debited')) {
      return 'UPI_DEBIT'
    }
    if (smsLower.includes('upi') && smsLower.includes('credited')) {
      return 'UPI_CREDIT'
    }
    if (smsLower.includes('card') && smsLower.includes('debited')) {
      return 'CARD_DEBIT'
    }
    if (smsLower.includes('card') && smsLower.includes('credited')) {
      return 'CARD_CREDIT'
    }
    if (smsLower.includes('balance') && smsLower.includes('low')) {
      return 'BALANCE_ALERT_LOW'
    }
    if (smsLower.includes('balance') && smsLower.includes('high')) {
      return 'BALANCE_ALERT_HIGH'
    }
    if (smsLower.includes('neft') || smsLower.includes('rtgs') || smsLower.includes('imps')) {
      return 'BANK_TRANSFER'
    }
    if (smsLower.includes('emi') || smsLower.includes('loan')) {
      return 'LOAN_TRANSACTION'
    }
    if (smsLower.includes('wallet') || smsLower.includes('paytm') || smsLower.includes('phonepe')) {
      return 'WALLET_TRANSACTION'
    }

    return 'OTHER'
  }

  /**
   * Extract variable fields from template
   */
  private static extractVariableFields(template: string): string[] {
    const fields: string[] = []
    const matches = template.match(/\[([A-Z_]+)\]/g)

    if (matches) {
      fields.push(...matches.map((match) => match.slice(1, -1))) // Remove brackets
    }

    return [...new Set(fields)] // Remove duplicates
  }
}
