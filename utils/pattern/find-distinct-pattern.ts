import { PatternStatus, PatternType } from '@/types/patterns/enums'
import type { DistinctPattern, Transaction } from '@/types/sms/transaction'
import stringSimilarity from 'string-similarity-js'
import { generateExtractionTemplate } from './extraction-template-generator'
import { normalizeSMSTemplate } from './normalize-sms-template'

export function findDistinctPatterns(transactions: Transaction[]): DistinctPattern[] {
  const patterns: DistinctPattern[] = []
  const processedTransactions = new Set<string>()

  for (const transaction of transactions) {
    // Skip if this transaction is already processed
    if (processedTransactions.has(transaction.id)) {
      continue
    }

    // First, generate a simple grouping template for fast comparison
    const groupingTemplate = normalizeSMSTemplate(transaction.message.body)

    // Find all transactions with similar grouping templates
    const similarTransactions = transactions.filter((t) => {
      if (processedTransactions.has(t.id)) {
        return false // Skip already processed transactions
      }
      const otherGroupingTemplate = normalizeSMSTemplate(t.message.body)
      const similarity = stringSimilarity(groupingTemplate, otherGroupingTemplate)
      return similarity >= 0.8 // 80% similarity threshold
    })

    if (similarTransactions.length > 0) {
      // Mark all similar transactions as processed
      similarTransactions.forEach((t) => processedTransactions.add(t.id))

      // Generate extraction template using all similar transactions (alignment-based)
      const template = generateExtractionTemplate(similarTransactions)

      const pattern: DistinctPattern = {
        id: `pattern_${patterns.length + 1}`,
        template, // Extraction template for data extraction
        groupingTemplate, // Aggressive template for grouping
        patternType: PatternType.Debit, // v1: only debit
        occurrences: similarTransactions.length,
        status: PatternStatus.NeedsReview,
        transactions: similarTransactions,
      }

      patterns.push(pattern)
    }
  }

  return patterns.sort((a, b) => b.occurrences - a.occurrences)
}
