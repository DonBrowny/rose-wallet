import type { NewPattern, TransactionType } from '@/db/schema'

/** A transaction parsed from an SMS body — not yet persisted or merchant-canonicalized. */
export interface ExtractedTxn {
  smsId: number
  amount: number
  type: TransactionType
  merchantRaw: string
  date: number
  patternId?: number
}

/** A discovered pattern awaiting user review. Field names match the patterns table. */
export interface PatternDraft
  extends Pick<NewPattern, 'name' | 'groupingPattern' | 'extractionPattern' | 'type' | 'sender'> {
  occurrences: number
  sampleSmsIds: number[]
}

export interface SyncStats {
  totalRead: number
  matched: number
  unmatched: number
  ignored: number
}
