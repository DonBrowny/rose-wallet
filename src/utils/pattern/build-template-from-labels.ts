import { compileTemplateToRegex } from './compile-template-to-regex'
import { extractWithPattern } from './extract-with-pattern'
import { proposeSlots } from './propose-slots'

export interface LabeledSample {
  body: string
  amount: number
  merchant?: string
}

export interface BuiltTemplate {
  template: string
  regexSource: string
  warnings: string[]
  /** Fraction of samples the template reproduces exactly (numeric amount compare). */
  accuracy: number
}

/**
 * Build the final extraction template from user-reviewed samples: propose a
 * candidate template per sample, then keep the one that reproduces the most
 * samples when compiled and re-run against them.
 */
export function buildTemplateFromLabels(samples: LabeledSample[]): BuiltTemplate | null {
  if (samples.length === 0) return null

  const candidates = new Map<string, ReturnType<typeof compileTemplateToRegex>>()
  for (const sample of samples) {
    const { template } = proposeSlots(sample.body, sample.amount, sample.merchant)
    if (!candidates.has(template)) candidates.set(template, compileTemplateToRegex(template))
  }

  let best: BuiltTemplate | null = null
  for (const [template, compiled] of candidates) {
    const correct = samples.filter((sample) => {
      const extraction = extractWithPattern(compiled.source, sample.body)
      if (!extraction || extraction.amount !== sample.amount) return false
      if (sample.merchant && extraction.merchantRaw?.toLowerCase() !== sample.merchant.trim().toLowerCase()) {
        return false
      }
      return true
    }).length

    const accuracy = correct / samples.length
    if (!best || accuracy > best.accuracy) {
      best = { template, regexSource: compiled.source, warnings: compiled.warnings, accuracy }
    }
  }

  return best
}
