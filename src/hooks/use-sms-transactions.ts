import { SMSDataExtractor } from '@/services/sms-parsing/sms-data-extractor-service'
import { SmsSyncService } from '@/services/sms-parsing/sms-sync-service'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import type { ReviewTxn } from '@/types/sms-parsing'
import { TRANSACTION_TYPE } from '@/db/schema'
import { storage } from '@/utils/mmkv/storage'
import { useQuery, type QueryClient } from '@tanstack/react-query'

function getOneMonthAgoTimestamp(): number {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.getTime()
}

async function fetchSMSTransactions(): Promise<ReviewTxn[]> {
  const lastRead = storage.getNumber(MMKV_KEYS.SMS.LAST_READ_AT)
  const startTimestamp = typeof lastRead === 'number' ? lastRead : getOneMonthAgoTimestamp()
  const endTimestamp = Date.now()

  const result = await SmsSyncService.syncWithQueue({ startTimestamp, endTimestamp })

  // Pattern-matched messages: deterministic extraction, linked to their pattern.
  // Everything here is queue-row-backed after syncWithQueue, so sms.id is the DB id.
  const fromPatterns: ReviewTxn[] = result.extracted.map((e) => ({
    smsId: Number(e.sms.id),
    patternId: e.patternId,
    amount: e.amount,
    type: e.type,
    merchantRaw: e.merchantRaw ?? '',
    date: e.sms.date,
    sender: e.sms.address,
    body: e.sms.body,
  }))

  // Unmatched candidates: parser-library bootstrap so new banks show up before
  // their pattern exists; reviewing them in the patterns screen creates one.
  const fromCandidates: ReviewTxn[] = []
  for (const candidate of result.candidates) {
    const intent = candidate.type === TRANSACTION_TYPE.Credit ? 'income' : 'expense'
    const fields = SMSDataExtractor.extract(candidate.sms.body, intent)
    const amount = fields.amount?.value
    if (!amount || amount <= 0) continue

    fromCandidates.push({
      smsId: Number(candidate.sms.id),
      amount,
      type: candidate.type,
      merchantRaw: fields.merchant ?? '',
      date: candidate.sms.date,
      sender: candidate.sms.address,
      body: candidate.sms.body,
      bank: fields.bank?.name,
    })
  }

  return [...fromPatterns, ...fromCandidates].sort((a, b) => a.date - b.date)
}

export const SMS_TRANSACTIONS_QUERY_KEY = 'sms-transactions'

/**
 * Drop a reviewed (saved or rejected) SMS from the cached review list instead of
 * invalidating: a refetch re-runs the whole SMS sync pipeline (native read + queue
 * triage) between every review action. Cancel any in-flight refetch first so its
 * stale result — fetched before this SMS's DB status changed — can't resurrect it.
 */
export async function removeReviewedSmsFromCache(queryClient: QueryClient, smsId: number) {
  await queryClient.cancelQueries({ queryKey: [SMS_TRANSACTIONS_QUERY_KEY] })
  queryClient.setQueryData<ReviewTxn[]>([SMS_TRANSACTIONS_QUERY_KEY], (old) => old?.filter((t) => t.smsId !== smsId))
}

export function useSMSTransactions() {
  const query = useQuery({
    queryKey: [SMS_TRANSACTIONS_QUERY_KEY],
    queryFn: fetchSMSTransactions,
  })

  const errorMessage = query.error instanceof Error ? query.error.message : query.error ? 'Failed to load SMS' : null

  return {
    ...query,
    errorMessage,
  }
}
