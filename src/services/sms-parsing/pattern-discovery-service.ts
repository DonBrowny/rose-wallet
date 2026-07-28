import { PATTERN_STATUS, TRANSACTION_TYPE } from '@/db/schema'
import { upsertPatternsByGrouping } from '@/services/database/patterns-repository'
import type { ReviewTxn } from '@/types/sms-parsing'
import type { DistinctPattern } from '@/types/sms/transaction'
import { murmurHash32 } from '@/utils/hash/murmur32'
import { setPatternSamplesByName } from '@/utils/mmkv/pattern-samples'
import { groupByTemplate } from '@/utils/pattern/group-by-template'
import { mergeSimilarGroups } from '@/utils/pattern/merge-similar-groups'
import { reconcileGroupSamples } from '@/utils/pattern/reconcile-group-samples'
import { SMSDataExtractor } from './sms-data-extractor-service'
import { SMSReaderService } from './sms-reader-service'
import { SmsSyncService, type CandidateSms } from './sms-sync-service'

const SAMPLES_PER_PATTERN = 3

interface CandidateSample {
  candidate: CandidateSms
  transaction: ReviewTxn
}

/**
 * Batch discovery: turn unmatched transaction-candidates into needs-review
 * pattern drafts. The rule-based extractor bootstraps amount/merchant per
 * message, then each group's guesses are reconciled against the consensus
 * template so review shows consistent pre-fills instead of one-off misreads.
 */
export class PatternDiscoveryService {
  static async discoverFromLastNDays(days: number): Promise<{ patternsFound: number }> {
    const range = SMSReaderService.createLastNDaysRange(days)
    // Queue-backed sync: candidates include the durable backlog, not just this window.
    const { candidates } = await SmsSyncService.syncWithQueue(range)

    const samples: CandidateSample[] = []
    for (const candidate of candidates) {
      const intent = candidate.type === TRANSACTION_TYPE.Credit ? 'income' : 'expense'
      const fields = SMSDataExtractor.extract(candidate.sms.body, intent)
      const amount = fields.amount?.value
      if (!amount || amount <= 0) continue

      samples.push({
        candidate,
        transaction: {
          smsId: Number(candidate.sms.id),
          amount,
          type: candidate.type,
          merchantRaw: fields.merchant ?? '',
          date: candidate.sms.date,
          sender: candidate.sms.address,
          body: candidate.sms.body,
          bank: fields.bank?.name,
        },
      })
    }

    const groups = mergeSimilarGroups(groupByTemplate(samples, (s) => s.candidate.normalized)).sort(
      (a, b) => b.items.length - a.items.length
    )

    const drafts: DistinctPattern[] = groups.map((group, index) => {
      const { template, samples: transactions } = reconcileGroupSamples(group.items.map((s) => s.transaction))

      return {
        id: String(index + 1),
        template,
        groupingTemplate: group.groupingPattern,
        occurrences: group.items.length,
        transactions,
        patternType: TRANSACTION_TYPE.Debit, // v1: only debit
        status: PATTERN_STATUS.NeedsReview,
      }
    })

    await upsertPatternsByGrouping(drafts)
    for (const draft of drafts) {
      setPatternSamplesByName(murmurHash32(draft.groupingTemplate), draft.transactions.slice(0, SAMPLES_PER_PATTERN))
    }

    return { patternsFound: drafts.length }
  }
}
