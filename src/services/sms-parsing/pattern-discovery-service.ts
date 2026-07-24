import { PATTERN_STATUS, TRANSACTION_TYPE } from '@/db/schema'
import { upsertPatternsByGrouping } from '@/services/database/patterns-repository'
import type { DistinctPattern, Transaction } from '@/types/sms/transaction'
import { murmurHash32 } from '@/utils/hash/murmur32'
import { setPatternSamplesByName } from '@/utils/mmkv/pattern-samples'
import { groupByTemplate } from '@/utils/pattern/group-by-template'
import { mergeSimilarGroups } from '@/utils/pattern/merge-similar-groups'
import { proposeSlots } from '@/utils/pattern/propose-slots'
import { SMSDataExtractor } from './sms-data-extractor-service'
import { SMSReaderService } from './sms-reader-service'
import { SmsSyncService, type CandidateSms } from './sms-sync-service'

const SAMPLES_PER_PATTERN = 3

interface CandidateSample {
  candidate: CandidateSms
  transaction: Transaction
}

/**
 * Batch discovery: turn unmatched transaction-candidates into needs-review
 * pattern drafts. The parser library bootstraps amount/merchant so review
 * shows pre-filled guesses instead of blank slots.
 */
export class PatternDiscoveryService {
  static async discoverFromLastNDays(days: number): Promise<{ patternsFound: number }> {
    const range = SMSReaderService.createLastNDaysRange(days)
    const { candidates } = await SmsSyncService.sync(range)

    const samples: CandidateSample[] = []
    for (const candidate of candidates) {
      const intent = candidate.type === TRANSACTION_TYPE.Credit ? 'income' : 'expense'
      const fields = SMSDataExtractor.extract(candidate.sms.body, intent)
      const amount = fields.amount?.value
      if (!amount || amount <= 0) continue

      samples.push({
        candidate,
        transaction: {
          id: candidate.sms.id,
          amount,
          merchant: fields.merchant || 'Unknown',
          bankName: fields.bank?.name || 'Unknown',
          transactionDate: candidate.sms.date,
          message: candidate.sms,
        },
      })
    }

    const groups = mergeSimilarGroups(groupByTemplate(samples, (s) => s.candidate.normalized)).sort(
      (a, b) => b.items.length - a.items.length
    )

    const drafts: DistinctPattern[] = groups.map((group, index) => {
      const first = group.items[0].transaction
      const { template } = proposeSlots(
        first.message.body,
        first.amount,
        first.merchant !== 'Unknown' ? first.merchant : undefined
      )

      return {
        id: String(index + 1),
        template,
        groupingTemplate: group.groupingPattern,
        occurrences: group.items.length,
        transactions: group.items.map((s) => s.transaction),
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
