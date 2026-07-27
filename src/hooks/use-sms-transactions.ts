import { SMSDataExtractor } from '@/services/sms-parsing/sms-data-extractor-service'
import { SmsSyncService } from '@/services/sms-parsing/sms-sync-service'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import type { ReviewTxn } from '@/types/sms-parsing'
import { TRANSACTION_TYPE } from '@/db/schema'
import { storage } from '@/utils/mmkv/storage'
import { useQuery } from '@tanstack/react-query'

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
