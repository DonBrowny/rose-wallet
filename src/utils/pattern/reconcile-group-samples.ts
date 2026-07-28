import { buildTemplateFromLabels } from './build-template-from-labels'
import { extractWithTemplate } from './extract-with-template'
import { proposeSlots } from './propose-slots'

interface GroupSample {
  body: string
  amount: number
  merchantRaw: string
}

export interface ReconciledGroup<T> {
  /** Draft extraction template for the group — the consensus winner when one exists. */
  template: string
  samples: T[]
}

/** Consensus building is quadratic in samples examined; groups can be large. */
const MAX_LABEL_SAMPLES = 10

/**
 * Cross-check a group's per-message bootstrap guesses against each other.
 * Each sample proposes a template from its own guesses; the template that
 * reproduces the most samples wins, and every sample it can read is re-filled
 * from it. A minority mis-extraction (balance picked over amount, missed
 * merchant) is thereby outvoted by the group instead of surfacing in review.
 * Samples the winner cannot read keep their bootstrap values.
 */
export function reconcileGroupSamples<T extends GroupSample>(samples: T[]): ReconciledGroup<T> {
  if (samples.length === 0) return { template: '', samples }

  const built = buildTemplateFromLabels(
    samples.slice(0, MAX_LABEL_SAMPLES).map((s) => ({
      body: s.body,
      amount: s.amount,
      merchant: s.merchantRaw || undefined,
    }))
  )

  if (!built || built.accuracy === 0) {
    const first = samples[0]
    const { template } = proposeSlots(first.body, first.amount, first.merchantRaw || undefined)
    return { template, samples }
  }

  const reconciled = samples.map((sample) => {
    const extraction = extractWithTemplate(built.template, sample.body)
    if (!extraction?.amount) return sample
    return {
      ...sample,
      amount: extraction.amount,
      merchantRaw: extraction.merchantRaw ?? sample.merchantRaw,
    }
  })

  return { template: built.template, samples: reconciled }
}
