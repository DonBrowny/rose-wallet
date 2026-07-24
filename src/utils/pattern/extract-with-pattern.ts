import { parseAmount } from './parse-amount'

export interface PatternExtraction {
  amount?: number
  merchantRaw?: string
}

/**
 * Run a compiled extraction regex (from compileTemplateToRegex) against an SMS body.
 * Returns null when the message doesn't match the template structure, or when it
 * matches but the captured amount is not a valid positive value — a matched pattern
 * must never yield a garbage amount.
 */
export function extractWithPattern(regexSource: string, smsBody: string): PatternExtraction | null {
  if (!regexSource || !smsBody) return null

  let regex: RegExp
  try {
    regex = new RegExp(regexSource, 'i')
  } catch {
    return null
  }

  const match = regex.exec(smsBody)
  if (!match) return null

  const { amount: amountRaw, merchant } = match.groups ?? {}
  const extraction: PatternExtraction = {}

  if (amountRaw !== undefined) {
    const amount = parseAmount(amountRaw)
    if (amount === null) return null
    extraction.amount = amount
  }

  if (merchant !== undefined) {
    extraction.merchantRaw = merchant.trim()
  }

  return extraction
}
