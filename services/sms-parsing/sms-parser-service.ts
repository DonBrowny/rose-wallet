import { ALL_PATTERNS } from '@/constants/sms/bank-patterns'
import { BankPattern, ParsedTransaction, SMSMessage, SMSParseResult } from '@/types/sms/transaction'

export interface ParseOptions {
  patterns?: BankPattern[]
  includeDuplicates?: boolean
}

export interface ParseResult {
  success: boolean
  transactions: ParsedTransaction[]
  errors: string[]
  totalProcessed: number
  duplicatesFound: number
}

export class SMSParserService {
  /**
   * Parse SMS messages into transaction objects
   */
  static async parseSMSMessages(messages: SMSMessage[], options: ParseOptions = {}): Promise<ParseResult> {
    const { patterns = ALL_PATTERNS, includeDuplicates = true } = options

    const transactions: ParsedTransaction[] = []
    const errors: string[] = []
    let duplicatesFound = 0

    for (const message of messages) {
      try {
        const parseResult = this.parseSingleSMS(message, patterns)

        if (parseResult.success && parseResult.transaction) {
          // Check for duplicates
          const isDuplicate = this.isDuplicateTransaction(parseResult.transaction, transactions)

          if (isDuplicate) {
            duplicatesFound++
            if (includeDuplicates) {
              parseResult.transaction.isDuplicate = true
              transactions.push(parseResult.transaction)
            }
          } else {
            transactions.push(parseResult.transaction)
          }
        } else {
          errors.push(`Failed to parse SMS: ${parseResult.error || 'Unknown error'}`)
        }
      } catch (error) {
        errors.push(`Error processing SMS ${message.id}: ${error}`)
      }
    }

    return {
      success: errors.length === 0,
      transactions,
      errors,
      totalProcessed: messages.length,
      duplicatesFound,
    }
  }

  /**
   * Parse a single SMS message
   */
  private static parseSingleSMS(message: SMSMessage, patterns: BankPattern[]): SMSParseResult {
    // Find matching bank pattern
    const bankPattern = this.findMatchingBankPattern(message, patterns)

    if (!bankPattern) {
      return {
        success: false,
        error: 'No matching bank pattern found',
      }
    }

    // Try to match against bank's patterns
    for (const pattern of bankPattern.patterns) {
      const regex = new RegExp(pattern.regex, 'i')
      const match = message.body.match(regex)

      if (match) {
        try {
          const transaction = this.extractTransactionFromMatch(match, pattern, bankPattern.bankName, message)

          return {
            success: true,
            transaction,
            matchedPattern: pattern.name,
          }
        } catch (error) {
          return {
            success: false,
            error: `Failed to extract transaction data: ${error}`,
          }
        }
      }
    }

    return {
      success: false,
      error: 'No matching pattern found for this SMS format',
    }
  }

  /**
   * Find matching bank pattern for SMS message
   */
  private static findMatchingBankPattern(message: SMSMessage, patterns: BankPattern[]): BankPattern | null {
    return (
      patterns.find((pattern) =>
        pattern.senderNumbers.some((sender) => message.address.toUpperCase().includes(sender.toUpperCase()))
      ) || null
    )
  }

  /**
   * Extract transaction data from regex match
   */
  private static extractTransactionFromMatch(
    match: RegExpMatchArray,
    pattern: any,
    bankName: string,
    message: SMSMessage
  ): ParsedTransaction {
    const amount = this.extractAmount(match, pattern.fields.amount)
    const merchant = this.extractMerchant(match, pattern.fields.merchant)
    const transactionDate = this.extractDate(match, pattern.fields.date, message.date)
    const accountNumber = this.extractAccount(match, pattern.fields.account)
    const balance = pattern.fields.balance ? this.extractAmount(match, pattern.fields.balance) : undefined

    return {
      id: this.generateTransactionId(message, amount, transactionDate),
      amount,
      merchant: merchant.trim(),
      transactionType: 'debit', // All our patterns are for outgoing transactions
      bankName,
      accountNumber,
      transactionDate,
      rawSms: message.body,
      balance,
      category: this.suggestCategory(merchant),
    }
  }

  /**
   * Extract amount from regex match
   */
  private static extractAmount(match: RegExpMatchArray, fieldPattern: string): number {
    const amountStr = this.replacePlaceholders(match, fieldPattern)
    const amount = parseFloat(amountStr.replace(/[^\d.-]/g, ''))
    return isNaN(amount) ? 0 : amount
  }

  /**
   * Extract merchant name from regex match
   */
  private static extractMerchant(match: RegExpMatchArray, fieldPattern: string): string {
    return this.replacePlaceholders(match, fieldPattern)
  }

  /**
   * Extract transaction date from regex match
   */
  private static extractDate(match: RegExpMatchArray, fieldPattern: string, smsDate: number): Date {
    if (fieldPattern === 'current') {
      return new Date(smsDate)
    }

    const dateStr = this.replacePlaceholders(match, fieldPattern)
    return this.parseDateString(dateStr, smsDate)
  }

  /**
   * Extract account number from regex match
   */
  private static extractAccount(match: RegExpMatchArray, fieldPattern: string): string {
    return this.replacePlaceholders(match, fieldPattern)
  }

  /**
   * Replace regex placeholders with actual values
   */
  private static replacePlaceholders(match: RegExpMatchArray, pattern: string): string {
    return pattern.replace(/\$(\d+)/g, (_, index) => {
      const matchIndex = parseInt(index)
      return match[matchIndex] || ''
    })
  }

  /**
   * Parse date string from SMS
   */
  private static parseDateString(dateStr: string, fallbackDate: number): Date {
    try {
      // Handle different date formats
      if (dateStr.includes('-')) {
        // Format: 15-Dec-24
        const parts = dateStr.split('-')
        if (parts.length === 3) {
          const day = parseInt(parts[0])
          const month = this.getMonthNumber(parts[1])
          const year = 2000 + parseInt(parts[2])
          return new Date(year, month, day)
        }
      } else if (dateStr.includes('/')) {
        // Format: 12/12/24
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          const day = parseInt(parts[0])
          const month = parseInt(parts[1]) - 1
          const year = 2000 + parseInt(parts[2])
          return new Date(year, month, day)
        }
      }
    } catch (error) {
      console.warn('Failed to parse date:', dateStr, error)
    }

    return new Date(fallbackDate)
  }

  /**
   * Get month number from month name
   */
  private static getMonthNumber(monthName: string): number {
    const months: { [key: string]: number } = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    }
    return months[monthName.toLowerCase()] || 0
  }

  /**
   * Generate unique transaction ID
   */
  private static generateTransactionId(message: SMSMessage, amount: number, date: Date): string {
    const dateStr = date.toISOString().split('T')[0]
    const amountStr = amount.toString().replace('.', '')
    return `${message.id}_${amountStr}_${dateStr}`
  }

  /**
   * Check if transaction is duplicate
   */
  private static isDuplicateTransaction(
    newTransaction: ParsedTransaction,
    existingTransactions: ParsedTransaction[]
  ): boolean {
    return existingTransactions.some(
      (existing) =>
        existing.amount === newTransaction.amount &&
        existing.merchant === newTransaction.merchant &&
        Math.abs(existing.transactionDate.getTime() - newTransaction.transactionDate.getTime()) < 60000 // Within 1 minute
    )
  }

  /**
   * Suggest category based on merchant name
   */
  private static suggestCategory(merchant: string): string {
    const merchantLower = merchant.toLowerCase()

    if (merchantLower.includes('swiggy') || merchantLower.includes('zomato') || merchantLower.includes('food')) {
      return 'Food & Dining'
    }
    if (merchantLower.includes('uber') || merchantLower.includes('ola') || merchantLower.includes('taxi')) {
      return 'Transportation'
    }
    if (merchantLower.includes('amazon') || merchantLower.includes('flipkart') || merchantLower.includes('shopping')) {
      return 'Shopping'
    }
    if (merchantLower.includes('atm') || merchantLower.includes('withdrawal')) {
      return 'Cash Withdrawal'
    }
    if (merchantLower.includes('rent') || merchantLower.includes('housing')) {
      return 'Housing'
    }
    if (merchantLower.includes('electricity') || merchantLower.includes('water') || merchantLower.includes('gas')) {
      return 'Utilities'
    }

    return 'Other'
  }
}
