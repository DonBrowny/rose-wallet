import type { Pattern, TransactionType } from '@/db/schema'
import { getPatterns } from '@/services/database/patterns-repository'
import { bigrams } from '@/utils/pattern/bigrams'
import { compileTemplateToRegex } from '@/utils/pattern/compile-template-to-regex'
import { extractWithPattern } from '@/utils/pattern/extract-with-pattern'
import { isTransactionCandidate } from '@/utils/pattern/is-transaction-candidate'
import { matchPattern, type MatchCandidate } from '@/utils/pattern/match-pattern'
import { normalizeSMSTemplate } from '@/utils/pattern/normalize-sms-template'
import type { SMSMessage } from 'rose-sms-reader'
import { SMSService } from './sms-service'

export interface ExtractedSms {
  sms: SMSMessage
  patternId: number
  patternName: string
  amount: number
  merchantRaw?: string
}

export interface CandidateSms {
  sms: SMSMessage
  normalized: string
  type: TransactionType
}

export interface SyncResult {
  /** Matched an active pattern and extracted a valid amount. */
  extracted: ExtractedSms[]
  /** Looks like a transaction but matched no pattern — input for discovery/review. */
  candidates: CandidateSms[]
  ignored: number
  totalRead: number
}

function toMatchCandidates(patternList: Pattern[]): MatchCandidate<Pattern>[] {
  return patternList
    .filter((p) => p.groupingPattern)
    .map((p) => ({ value: p, groupingPattern: p.groupingPattern, bigrams: bigrams(p.groupingPattern) }))
}

/**
 * The hot path: read SMS in a time range, match each against known patterns once,
 * extract deterministically, and triage the rest with the rule-based candidate filter.
 */
export class SmsSyncService {
  static async sync(options: { startTimestamp: number; endTimestamp: number }): Promise<SyncResult> {
    const readResult = await SMSService.getTransactionalSMS(options)
    if (!readResult.success) {
      throw new Error(readResult.errors[0] || 'Failed to read SMS messages')
    }

    const { active, rejected } = await getPatterns()
    const activeCandidates = toMatchCandidates(active)
    const rejectedCandidates = toMatchCandidates(rejected)

    // Stored patterns approved before regex compilation existed carry only the
    // template — compile once per pattern per sync.
    const regexCache = new Map<number, string>()
    const getRegexSource = (pattern: Pattern): string => {
      const cached = regexCache.get(pattern.id)
      if (cached !== undefined) return cached
      const source =
        pattern.extractionRegex ??
        (pattern.extractionPattern ? compileTemplateToRegex(pattern.extractionPattern).source : '')
      regexCache.set(pattern.id, source)
      return source
    }

    const result: SyncResult = { extracted: [], candidates: [], ignored: 0, totalRead: readResult.sms.length }

    for (const sms of readResult.sms) {
      const normalized = normalizeSMSTemplate(sms.body)

      if (matchPattern(normalized, rejectedCandidates)) {
        result.ignored += 1
        continue
      }

      const match = matchPattern(normalized, activeCandidates)
      if (match) {
        const extraction = extractWithPattern(getRegexSource(match.value), sms.body)
        if (extraction?.amount) {
          result.extracted.push({
            sms,
            patternId: match.value.id,
            patternName: match.value.name,
            amount: extraction.amount,
            merchantRaw: extraction.merchantRaw,
          })
          continue
        }
        // Grouping matched but extraction failed — likely template drift.
        // Fall through so the message resurfaces as a candidate instead of vanishing.
      }

      const type = isTransactionCandidate(sms.body)
      if (type) {
        result.candidates.push({ sms, normalized, type })
      } else {
        result.ignored += 1
      }
    }

    return result
  }
}
