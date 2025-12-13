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

export async function matchPatternAndExtract(
  smsBody: string,
  providedPatterns: Pattern[]
): Promise<PatternMatchResult> {
  const raw = String(smsBody ?? '').trim()
  if (!raw) return {}

  const target = normalizeSMSTemplate(raw)

  let bestPattern: Pattern | undefined
  let bestScore = -1

  for (const p of providedPatterns) {
    const normalized = String(p.groupingPattern ?? '')
    if (!normalized) continue
    const score = target === normalized ? 1 : stringSimilarity(target, normalized)
    if (score > bestScore) {
      bestScore = score
      bestPattern = p
    }
    if (bestScore === 1) break
  }

  const acceptedPattern = bestScore >= 0.8 ? bestPattern : undefined
  let amount: string | undefined
  let merchant: string | undefined

  if (acceptedPattern?.extractionPattern) {
    const tRes = extractAmountAndMerchant(acceptedPattern.extractionPattern, raw)
    amount = tRes.amount
    merchant = tRes.merchant
  }

  return { patternId: acceptedPattern?.id, patternName: acceptedPattern?.name, amount, merchant }
}
