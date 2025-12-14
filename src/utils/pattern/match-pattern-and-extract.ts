import type { Pattern } from '@/db/schema'
import stringSimilarity from 'string-similarity-js'
import { extractAmountAndMerchant } from './extraction-template-builder'
import { normalizeSMSTemplate } from './normalize-sms-template'

export interface PatternMatchResult {
  patternId?: number
  patternName?: string
  amount?: string
  merchant?: string
}

const SIMILARITY_THRESHOLD = 0.8

export function matchPatternAndExtract(smsBody: string, patterns: Pattern[]): PatternMatchResult {
  const raw = String(smsBody ?? '').trim()
  if (!raw) return {}

  const target = normalizeSMSTemplate(raw)

  // Fast path: exact match
  const exactMatch = patterns.find((p) => p.groupingPattern === target)
  if (exactMatch) {
    return buildResult(exactMatch, raw)
  }

  // Slow path: find best similarity match
  const best = patterns.reduce<{ pattern: Pattern; score: number } | null>((acc, p) => {
    if (!p.groupingPattern) return acc
    const score = stringSimilarity(target, p.groupingPattern)
    if (score >= SIMILARITY_THRESHOLD && (!acc || score > acc.score)) {
      return { pattern: p, score }
    }
    return acc
  }, null)

  return best ? buildResult(best.pattern, raw) : {}
}

function buildResult(pattern: Pattern, smsBody: string): PatternMatchResult {
  const { amount, merchant } = pattern.extractionPattern
    ? extractAmountAndMerchant(pattern.extractionPattern, smsBody)
    : { amount: undefined, merchant: undefined }

  return { patternId: pattern.id, patternName: pattern.name, amount, merchant }
}
