import { stringSimilarity } from 'string-similarity-js'
import type { Transaction } from '../../types/sms/transaction'
import { normalizeSMSTemplate } from './normalize-sms-template'

export function calculatePatternConfidence(transactions: Transaction[]): number {
  if (transactions.length <= 1) return 0.5

  const template = normalizeSMSTemplate(transactions[0].message.body)
  const similarities = transactions.map((t) => stringSimilarity(template, normalizeSMSTemplate(t.message.body)))

  const avgSimilarity = similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length
  return Math.min(0.95, Math.max(0.5, avgSimilarity))
}
