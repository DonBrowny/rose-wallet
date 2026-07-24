export const AMT_PLACEHOLDER = '<AMT>'
export const MERCHANT_PLACEHOLDER = '<MERCHANT>'

export interface CompiledTemplate {
  /** Regex source with named groups `amount`/`merchant`. Use with the 'i' flag. */
  source: string
  /** Non-fatal issues found at compile time (e.g. ambiguous adjacent slots). */
  warnings: string[]
}

const AMOUNT_PATTERN = '(?:\\d{1,3}(?:,\\d{2,3})+|\\d+)(?:\\.\\d{1,2})?'
const MERCHANT_PATTERN = '.+?'

// Volatile literal tokens vary between messages of the same template (dates, refs,
// balances, masked accounts) and must be generalized, not matched verbatim.
const NUMBER_TOKEN = '\\d[\\d,]*(?:\\.\\d+)?(?![A-Za-z])'
const ALNUM_TOKEN = '[A-Za-z]*\\d[A-Za-z\\d]*'
const LITERAL_TOKENIZER = new RegExp(`(\\s+)|(${NUMBER_TOKEN}|${ALNUM_TOKEN})`, 'g')

const NUMBER_GENERALIZED = '\\d[\\d,]*(?:\\.\\d+)?'
const ALNUM_GENERALIZED = '[A-Za-z\\d]+'

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function generalizeLiteral(literal: string): string {
  let out = ''
  let lastIndex = 0

  for (const match of literal.matchAll(LITERAL_TOKENIZER)) {
    out += escapeRegex(literal.slice(lastIndex, match.index))
    if (match[1]) {
      out += '\\s+'
    } else {
      out += /^[\d,.]+$/.test(match[2]) ? NUMBER_GENERALIZED : ALNUM_GENERALIZED
    }
    lastIndex = match.index + match[0].length
  }

  return out + escapeRegex(literal.slice(lastIndex))
}

function isPlaceholder(part: string): boolean {
  return part === AMT_PLACEHOLDER || part === MERCHANT_PLACEHOLDER
}

/**
 * Compile an extraction template (SMS body with <AMT>/<MERCHANT> placeholders) into an
 * anchored regex that validates the message structure and extracts values in one pass.
 * Volatile literals (dates, refs, balances) are generalized so they may differ between
 * messages of the same template.
 */
export function compileTemplateToRegex(template: string): CompiledTemplate {
  const parts = template.trim().split(/(<AMT>|<MERCHANT>)/)
  const warnings: string[] = []
  const seen = new Set<string>()
  let source = '^\\s*'

  for (const part of parts) {
    if (part === AMT_PLACEHOLDER) {
      source += seen.has(part) ? AMOUNT_PATTERN : `(?<amount>${AMOUNT_PATTERN})`
      if (seen.has(part)) warnings.push('duplicate <AMT> placeholder; only the first is captured')
      seen.add(part)
    } else if (part === MERCHANT_PLACEHOLDER) {
      source += seen.has(part) ? MERCHANT_PATTERN : `(?<merchant>${MERCHANT_PATTERN})`
      if (seen.has(part)) warnings.push('duplicate <MERCHANT> placeholder; only the first is captured')
      seen.add(part)
    } else {
      source += generalizeLiteral(part)
    }
  }

  source += '\\s*$'

  for (let i = 0; i + 2 < parts.length; i += 1) {
    if (isPlaceholder(parts[i]) && parts[i + 1].trim() === '' && isPlaceholder(parts[i + 2])) {
      warnings.push(`ambiguous template: ${parts[i]} and ${parts[i + 2]} have no anchoring text between them`)
    }
  }

  if (!seen.has(AMT_PLACEHOLDER)) {
    warnings.push('template has no <AMT> placeholder; extraction will not produce an amount')
  }

  return { source, warnings }
}
