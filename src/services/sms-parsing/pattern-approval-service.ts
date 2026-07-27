import { incrementPatternUsageByName, updatePatternTemplateByName } from '@/services/database/patterns-repository'
import { getUnmatchedSms } from '@/services/database/sms-messages-repository'
import type { ReviewTxn } from '@/types/sms-parsing'
import { setPatternSamplesByName } from '@/utils/mmkv/pattern-samples'
import { buildTemplateFromLabels } from '@/utils/pattern/build-template-from-labels'
import { extractWithTemplate } from '@/utils/pattern/extract-with-template'

/** A template must reproduce at least this fraction of its own reviewed samples. */
const MIN_ACCURACY = 0.5

export interface ApprovalResult {
  warnings: string[]
  accuracy: number
  /** Queued messages the newly approved pattern can now read. */
  backlogMatches: number
}

/**
 * Finalize a reviewed pattern: build the extraction template from the user's
 * corrected samples, compile it, verify it reproduces those samples, and save
 * both forms. Refuses to approve a template that can't read its own samples.
 * After saving, sweeps the residual queue so the approval retroactively pays off.
 */
export class PatternApprovalService {
  static async approve(name: string, samples: ReviewTxn[]): Promise<ApprovalResult> {
    if (!name) throw new Error('Pattern name is required')
    if (samples.length === 0) throw new Error('At least one reviewed sample is required')

    setPatternSamplesByName(name, samples)

    const built = buildTemplateFromLabels(
      samples.map((t) => ({
        body: t.body,
        amount: t.amount,
        merchant: t.merchantRaw || undefined,
      }))
    )

    if (!built || built.accuracy < MIN_ACCURACY) {
      throw new Error('Could not build a template that reproduces the reviewed samples')
    }

    await updatePatternTemplateByName(name, built.template)

    // Backlog sweep: count queued messages the new template reads. They stay
    // 'unmatched' — the next sync surfaces them as ready-to-confirm expenses;
    // they leave the queue when the user saves them.
    const queue = await getUnmatchedSms()
    const backlogMatches = queue.filter((row) => extractWithTemplate(built.template, row.body)?.amount).length
    await incrementPatternUsageByName(name, backlogMatches)

    return { warnings: built.warnings, accuracy: built.accuracy, backlogMatches }
  }
}
