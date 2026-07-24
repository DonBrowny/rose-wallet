import { updatePatternTemplateByName } from '@/services/database/patterns-repository'
import type { Transaction } from '@/types/sms/transaction'
import { setPatternSamplesByName } from '@/utils/mmkv/pattern-samples'
import { buildTemplateFromLabels } from '@/utils/pattern/build-template-from-labels'

/** A template must reproduce at least this fraction of its own reviewed samples. */
const MIN_ACCURACY = 0.5

export interface ApprovalResult {
  warnings: string[]
  accuracy: number
}

/**
 * Finalize a reviewed pattern: build the extraction template from the user's
 * corrected samples, compile it, verify it reproduces those samples, and save
 * both forms. Refuses to approve a template that can't read its own samples.
 */
export class PatternApprovalService {
  static async approve(name: string, samples: Transaction[]): Promise<ApprovalResult> {
    if (!name) throw new Error('Pattern name is required')
    if (samples.length === 0) throw new Error('At least one reviewed sample is required')

    setPatternSamplesByName(name, samples)

    const built = buildTemplateFromLabels(
      samples.map((t) => ({
        body: t.message.body,
        amount: t.amount,
        merchant: t.merchant && t.merchant !== 'Unknown' ? t.merchant : undefined,
      }))
    )

    if (!built || built.accuracy < MIN_ACCURACY) {
      throw new Error('Could not build a template that reproduces the reviewed samples')
    }

    await updatePatternTemplateByName(name, built.template, built.regexSource)

    return { warnings: built.warnings, accuracy: built.accuracy }
  }
}
