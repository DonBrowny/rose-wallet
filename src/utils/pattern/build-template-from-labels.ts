import { extractWithTemplate } from './extract-with-template'
import { AMT_PLACEHOLDER, isPlaceholderToken } from './placeholders'
import { proposeSlots } from './propose-slots'

export interface LabeledSample {
  body: string
  amount: number
  merchant?: string
}

export interface BuiltTemplate {
  template: string
  warnings: string[]
  /** Fraction of samples the template reproduces exactly (numeric amount compare). */
  accuracy: number
}

function templateWarnings(template: string): string[] {
  const warnings: string[] = []
  if (!template.includes(AMT_PLACEHOLDER)) {
    warnings.push('template has no <AMT> placeholder; extraction will not produce an amount')
  }

  const tokens = template.trim().split(/\s+/)
  for (let i = 0; i + 1 < tokens.length; i += 1) {
    if (isPlaceholderToken(tokens[i]) && isPlaceholderToken(tokens[i + 1])) {
      warnings.push(`ambiguous template: ${tokens[i]} and ${tokens[i + 1]} have no anchoring text between them`)
    }
  }

  return warnings
}

/**
 * Build the final extraction template from user-reviewed samples: propose a
 * candidate template per sample, then keep the one that reproduces the most
 * samples when re-run against them.
 */
export function buildTemplateFromLabels(samples: LabeledSample[]): BuiltTemplate | null {
  if (samples.length === 0) return null

  const candidates = new Set<string>()
  for (const sample of samples) {
    const { template } = proposeSlots(sample.body, sample.amount, sample.merchant)
    candidates.add(template)
  }

  let best: BuiltTemplate | null = null
  for (const template of candidates) {
    const correct = samples.filter((sample) => {
      const extraction = extractWithTemplate(template, sample.body)
      if (!extraction || extraction.amount !== sample.amount) return false
      if (sample.merchant && extraction.merchantRaw?.toLowerCase() !== sample.merchant.trim().toLowerCase()) {
        return false
      }
      return true
    }).length

    const accuracy = correct / samples.length
    if (!best || accuracy > best.accuracy) {
      best = { template, warnings: templateWarnings(template), accuracy }
    }
  }

  return best
}
