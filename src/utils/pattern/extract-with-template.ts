import { diffArrays } from 'diff'
import { parseAmount } from './parse-amount'
import { AMT_PLACEHOLDER, isPlaceholderToken, MERCHANT_PLACEHOLDER } from './placeholders'

export interface PatternExtraction {
  amount?: number
  merchantRaw?: string
}

function sameToken(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase()
}

/**
 * Volatile tokens (dates, refs, balances, masked accounts) all carry digits;
 * they may differ freely between messages of the same template. Word tokens
 * are structural and must match — "debited" drifting to "credited" is a
 * different message, not the same template.
 */
function isVolatileToken(token: string): boolean {
  return /\d/.test(token)
}

function stripAffixes(captured: string, templateToken: string, placeholder: string): string {
  const [prefix, suffix] = templateToken.split(placeholder)
  let out = captured
  if (prefix && out.toLowerCase().startsWith(prefix.toLowerCase())) out = out.slice(prefix.length)
  if (suffix && out.toLowerCase().endsWith(suffix.toLowerCase())) out = out.slice(0, out.length - suffix.length)
  return out.trim()
}

/**
 * Align an extraction template (SMS body with <AMT>/<MERCHANT> placeholders)
 * against a message token-by-token and read the placeholder values from the
 * aligned gaps. Returns null when the message doesn't share the template's
 * structure: any word-token mismatch, an ambiguous placeholder alignment, or
 * a placeholder that yields no valid value rejects the whole message — a
 * matched pattern must never produce a garbage amount or merchant.
 */
export function extractWithTemplate(template: string, smsBody: string): PatternExtraction | null {
  if (!template.trim() || !smsBody.trim()) return null

  const templateTokens = template.trim().split(/\s+/)
  const smsTokens = smsBody.trim().split(/\s+/)
  const hunks = diffArrays(templateTokens, smsTokens, { comparator: sameToken })

  let amountText: string | undefined
  let merchantText: string | undefined
  let pairedAdd = false

  for (let i = 0; i < hunks.length; i += 1) {
    const hunk = hunks[i]

    if (hunk.added) {
      // Insertions the template knows nothing about: tolerable only when
      // volatile — a new word changes the message's meaning.
      if (!pairedAdd && hunk.value.some((token) => !isVolatileToken(token))) return null
      pairedAdd = false
      continue
    }
    if (!hunk.removed) continue

    const added = hunks[i + 1]?.added ? hunks[i + 1] : undefined
    pairedAdd = added !== undefined

    const placeholderTokens = hunk.value.filter(isPlaceholderToken)
    if (placeholderTokens.length === 0) {
      if (hunk.value.some((token) => !isVolatileToken(token))) return null
      continue
    }

    // A placeholder aligns reliably only when it is the sole token in its gap;
    // fused with a drifted neighbor there is no way to place the boundary.
    if (hunk.value.length > 1) return null
    const token = hunk.value[0]
    if (token.includes(AMT_PLACEHOLDER) && token.includes(MERCHANT_PLACEHOLDER)) return null

    const placeholder = token.includes(AMT_PLACEHOLDER) ? AMT_PLACEHOLDER : MERCHANT_PLACEHOLDER
    const captured = stripAffixes(added ? added.value.join(' ') : '', token, placeholder)
    if (placeholder === AMT_PLACEHOLDER) amountText = captured
    else merchantText = captured
  }

  const extraction: PatternExtraction = {}

  if (template.includes(AMT_PLACEHOLDER)) {
    const amount = parseAmount(amountText ?? '')
    if (amount === null) return null
    extraction.amount = amount
  }

  if (template.includes(MERCHANT_PLACEHOLDER)) {
    if (!merchantText) return null
    extraction.merchantRaw = merchantText
  }

  return extraction
}
