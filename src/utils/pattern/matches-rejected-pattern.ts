import type { Pattern } from '@/db/schema'
import stringSimilarity from 'string-similarity-js'
import { normalizeSMSTemplate } from './normalize-sms-template'

export function matchesRejectedPattern(smsBody: string, rejectedPatterns: Pattern[]): boolean {
  const raw = String(smsBody ?? '').trim()
  if (!raw || rejectedPatterns.length === 0) return false

  const target = normalizeSMSTemplate(raw)

  return rejectedPatterns.some((p) => {
    const normalized = String(p.groupingPattern ?? '')
    if (!normalized) return false
    const score = target === normalized ? 1 : stringSimilarity(target, normalized)
    return score >= 0.8
  })
}
