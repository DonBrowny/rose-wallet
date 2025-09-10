import { ParsedTransaction, SMSMessage } from '@/types/sms/transaction'
import { getTransactionInfo, type ITransactionInfo } from 'transaction-sms-parser'

export interface ParseOptions {
  includeDuplicates?: boolean
}

export interface ParseResult {
  transactions: ParsedTransaction[]
  errors: string[]
  totalProcessed: number
  duplicatesFound: number
}

export class SMSParserService {
  /**
   * Parse SMS messages into transaction objects using transaction-sms-parser library
   */
  static async parseSMSMessages(messages: SMSMessage[], options: ParseOptions = {}): Promise<ParseResult> {
    const { includeDuplicates = true } = options

    const transactions: ParsedTransaction[] = []
    const errors: string[] = []
    let duplicatesFound = 0

    for (const message of messages) {
      try {
        const parseResult = this.parseSingleSMS(message)

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
      transactions,
      errors,
      totalProcessed: messages.length,
      duplicatesFound,
    }
  }

  /**
   * Parse a single SMS message using transaction-sms-parser library
   */
  private static parseSingleSMS(message: SMSMessage): {
    success: boolean
    transaction?: ParsedTransaction
    error?: string
  } {
    try {
      // Use the transaction-sms-parser library to parse the SMS
      const transactionInfo = getTransactionInfo(message.body)

      // Check if we got valid transaction data
      if (!transactionInfo.transaction.amount || !transactionInfo.account.type) {
        return {
          success: false,
          error: 'No valid transaction data found in SMS',
        }
      }

      // Convert the library's result to our ParsedTransaction format
      const transaction = this.convertToParsedTransaction(transactionInfo, message)

      return {
        success: true,
        transaction,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse SMS: ${error}`,
      }
    }
  }

  /**
   * Convert ITransactionInfo to ParsedTransaction
   */
  private static convertToParsedTransaction(transactionInfo: ITransactionInfo, message: SMSMessage): ParsedTransaction {
    const amount = parseFloat(transactionInfo.transaction.amount || '0')
    const transactionDate = new Date(message.date)

    // Extract bank name from account type or use a default
    const bankName = this.extractBankNameFromAccount(transactionInfo.account)

    // Get merchant name and reference number
    const merchant = transactionInfo.transaction.merchant || 'Unknown'
    const referenceNo = transactionInfo.transaction.referenceNo || undefined

    return {
      id: this.generateTransactionId(message, amount, transactionDate),
      amount,
      merchant: merchant.trim(),
      transactionType: transactionInfo.transaction.type === 'debit' ? 'debit' : 'credit',
      bankName,
      accountNumber: transactionInfo.account.number || '',
      transactionDate,
      rawSms: message.body,
      balance: transactionInfo.balance?.available ? parseFloat(transactionInfo.balance.available) : undefined,
      category: this.suggestCategory(merchant),
      referenceNo,
      message,
    }
  }

  /**
   * Extract bank name from account information
   */
  private static extractBankNameFromAccount(account: any): string {
    // This is a simplified approach - in a real app, you might want to maintain
    // a mapping of account numbers to bank names
    if (account.type === 'CARD') {
      return 'Credit Card'
    } else if (account.type === 'WALLET') {
      return 'Digital Wallet'
    } else if (account.type === 'ACCOUNT') {
      return 'Bank Account'
    }
    return 'Unknown Bank'
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
