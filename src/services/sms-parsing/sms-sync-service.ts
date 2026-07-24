import type { Pattern, TransactionType } from '@/db/schema'
import { SMS_MATCH_STATUS } from '@/db/schema'
import { getPatterns } from '@/services/database/patterns-repository'
import {
  enqueueUnmatchedSms,
  getUnmatchedSms,
  updateSmsMatchStatusByIds,
  type QueuedSms,
} from '@/services/database/sms-messages-repository'
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

interface TriageContext {
  activeCandidates: MatchCandidate<Pattern>[]
  rejectedCandidates: MatchCandidate<Pattern>[]
  getRegexSource: (pattern: Pattern) => string
}

function toMatchCandidates(patternList: Pattern[]): MatchCandidate<Pattern>[] {
  return patternList
    .filter((p) => p.groupingPattern)
    .map((p) => ({ value: p, groupingPattern: p.groupingPattern, bigrams: bigrams(p.groupingPattern) }))
}

function queuedSmsToMessage(row: QueuedSms): SMSMessage {
  return { id: String(row.id), body: row.body, address: row.sender, date: row.date, read: true, type: 1 }
}

/**
 * The hot path: read SMS in a time range, match each against known patterns once,
 * extract deterministically, and triage the rest with the rule-based candidate filter.
 */
export class SmsSyncService {
  private static async buildContext(): Promise<TriageContext> {
    const { active, rejected } = await getPatterns()

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

    return {
      activeCandidates: toMatchCandidates(active),
      rejectedCandidates: toMatchCandidates(rejected),
      getRegexSource,
    }
  }

  private static triageMessages(messages: SMSMessage[], context: TriageContext): SyncResult {
    const result: SyncResult = { extracted: [], candidates: [], ignored: 0, totalRead: messages.length }

    for (const sms of messages) {
      const normalized = normalizeSMSTemplate(sms.body)

      if (matchPattern(normalized, context.rejectedCandidates)) {
        result.ignored += 1
        continue
      }

      const match = matchPattern(normalized, context.activeCandidates)
      if (match) {
        const extraction = extractWithPattern(context.getRegexSource(match.value), sms.body)
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

  /** Triage fresh messages in a range without touching the residual queue. */
  static async sync(options: { startTimestamp: number; endTimestamp: number }): Promise<SyncResult> {
    const readResult = await SMSService.getTransactionalSMS(options)
    if (!readResult.success) {
      throw new Error(readResult.errors[0] || 'Failed to read SMS messages')
    }

    const context = await this.buildContext()
    return this.triageMessages(readResult.sms, context)
  }

  /**
   * Full flow: triage fresh messages, persist everything transaction-relevant into
   * the residual queue (content-hash deduped), then re-triage the whole queue —
   * so newly approved patterns pick up their backlog, newly rejected ones flush
   * theirs, and unhandled messages survive past the read cursor.
   */
  static async syncWithQueue(options: { startTimestamp: number; endTimestamp: number }): Promise<SyncResult> {
    const readResult = await SMSService.getTransactionalSMS(options)
    if (!readResult.success) {
      throw new Error(readResult.errors[0] || 'Failed to read SMS messages')
    }

    const context = await this.buildContext()
    const fresh = this.triageMessages(readResult.sms, context)

    await enqueueUnmatchedSms(
      [...fresh.extracted.map((e) => e.sms), ...fresh.candidates.map((c) => c.sms)].map((sms) => ({
        sender: sms.address,
        body: sms.body,
        date: sms.date,
      }))
    )

    const queue = await getUnmatchedSms()
    const result = this.triageMessages(queue.map(queuedSmsToMessage), context)

    // Queue rows that are neither extractable nor candidates anymore (e.g. their
    // pattern was rejected) are noise — flush them so the queue stays small.
    const liveIds = new Set([...result.extracted.map((e) => e.sms.id), ...result.candidates.map((c) => c.sms.id)])
    const ignoredIds = queue.filter((row) => !liveIds.has(String(row.id))).map((row) => row.id)
    await updateSmsMatchStatusByIds(ignoredIds, SMS_MATCH_STATUS.Ignored)

    return { ...result, totalRead: fresh.totalRead }
  }
}
