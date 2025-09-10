import type { DistinctPattern, Transaction } from '@/types/sms/transaction'
import stringSimilarity from 'string-similarity-js'
import { calculatePatternConfidence } from './calculate-pattern-confidence'
import { determinePatternType } from './determine-pattern-type'
import { extractVariableFields } from './extract-variable-fields'
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

    const template = normalizeSMSTemplate(rawSms)

    // Find all transactions with similar templates
    const similarTransactions = transactions.filter((t) => {
      if (processedTransactions.has(t.id)) {
        return false // Skip already processed transactions
      }
      const similarity = stringSimilarity(template, normalizeSMSTemplate(t.message.body))
      return similarity >= 0.8 // 80% similarity threshold
    })

    if (similarTransactions.length > 0) {
      // Mark all similar transactions as processed
      similarTransactions.forEach((t) => processedTransactions.add(t.id))

      const pattern = {
        id: `pattern_${patterns.length + 1}`,
        template,
        patternType: determinePatternType(rawSms),
        occurrences: similarTransactions.length,
        confidence: calculatePatternConfidence(similarTransactions),
        transactions: similarTransactions,
        sampleSMS: rawSms,
        variableFields: extractVariableFields(rawSms),
      }

      patterns.push(pattern)
    }
  }

  return patterns.sort((a, b) => b.occurrences - a.occurrences)
}
