import type { DistinctPattern, Transaction } from '@/types/sms/transaction'
import { generateExtractionTemplate } from '@/utils/pattern/extraction-template-generator'

export interface UserCorrection {
  patternId: string
  originalTransaction: Transaction
  correctedAmount: number
  correctedMerchant: string
  timestamp: Date
}

export interface PatternLearningResult {
  success: boolean
  patternUpdated: boolean
  transactionsUpdated: number
  newConfidence: number
  error?: string
}

export class PatternLearningService {
  private static corrections: UserCorrection[] = []

  /**
   * Learn from user correction and update the pattern
   * When user makes corrections, it means they're approving the pattern
   */
  static async learnFromUserCorrection(
    correction: UserCorrection,
    pattern: DistinctPattern
  ): Promise<PatternLearningResult> {
    try {
      // Store the correction
      this.corrections.push(correction)

      // Update all transactions in this pattern with the corrected data
      const updatedCount = this.updatePatternTransactions(pattern, correction)

      // Update pattern template and set confidence to 100% (approved)
      this.updatePatternTemplate(pattern, correction)
      pattern.confidence = 1.0

      return {
        success: true,
        patternUpdated: true,
        transactionsUpdated: updatedCount,
        newConfidence: 1.0,
      }
    } catch (error) {
      return {
        success: false,
        patternUpdated: false,
        transactionsUpdated: 0,
        newConfidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Update all transactions in the pattern with corrected data
   */
  private static updatePatternTransactions(pattern: DistinctPattern, correction: UserCorrection): number {
    let updatedCount = 0

    // Update all transactions in this pattern with the corrected values
    pattern.transactions.forEach((transaction) => {
      // Update amount
      if (transaction.amount !== correction.correctedAmount) {
        transaction.amount = correction.correctedAmount
        updatedCount++
      }

      // Update merchant
      if (transaction.merchant !== correction.correctedMerchant) {
        transaction.merchant = correction.correctedMerchant
        updatedCount++
      }
    })

    return updatedCount
  }

  /**
   * Update the pattern template based on user correction
   */
  private static updatePatternTemplate(pattern: DistinctPattern, correction: UserCorrection): void {
    // Update the corrected transaction in the pattern
    const correctedTransaction: Transaction = {
      ...correction.originalTransaction,
      amount: correction.correctedAmount,
      merchant: correction.correctedMerchant,
    }

    // Find the transaction in the pattern and update it
    const transactionIndex = pattern.transactions.findIndex((t) => t.id === correction.originalTransaction.id)
    if (transactionIndex !== -1) {
      pattern.transactions[transactionIndex] = correctedTransaction
    }

    // Regenerate template using all transactions in the pattern (alignment-based)
    const correctedTemplate = generateExtractionTemplate(pattern.transactions)

    if (correctedTemplate && correctedTemplate !== pattern.template) {
      pattern.template = correctedTemplate
    }
  }
}
