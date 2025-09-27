import type { DistinctPattern, Transaction } from '@/types/sms/transaction'
import stringSimilarity from 'string-similarity-js'
import { determinePatternType } from './determine-pattern-type'
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

    const rawSms = transaction.message.body

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

      const pattern = {
        id: `pattern_${patterns.length + 1}`,
        template, // Extraction template for data extraction
        groupingTemplate, // Aggressive template for grouping
        patternType: determinePatternType(rawSms),
        occurrences: similarTransactions.length,
        confidence: 0.5, // New patterns start with 50% confidence
        transactions: similarTransactions,
      }

      patterns.push(pattern)
    }
  }

  return patterns.sort((a, b) => b.occurrences - a.occurrences)
}
