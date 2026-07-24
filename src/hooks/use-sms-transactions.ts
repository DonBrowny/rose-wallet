import { TRANSACTION_TYPE } from '@/db/schema'
import { SMSDataExtractor } from '@/services/sms-parsing/sms-data-extractor-service'
import { SmsSyncService } from '@/services/sms-parsing/sms-sync-service'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import type { Transaction } from '@/types/sms/transaction'
import { storage } from '@/utils/mmkv/storage'
import { useQuery } from '@tanstack/react-query'

function getOneMonthAgoTimestamp(): number {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.getTime()
}

async function fetchSMSTransactions(): Promise<Transaction[]> {
  const lastRead = storage.getNumber(MMKV_KEYS.SMS.LAST_READ_AT)
  const startTimestamp = typeof lastRead === 'number' ? lastRead : getOneMonthAgoTimestamp()
  const endTimestamp = Date.now()

  const result = await SmsSyncService.sync({ startTimestamp, endTimestamp })

  // Pattern-matched messages: deterministic extraction, linked to their pattern.
  const fromPatterns: Transaction[] = result.extracted.map((e) => ({
    id: e.sms.id,
    patternId: e.patternId,
    amount: e.amount,
    merchant: e.merchantRaw || 'Unknown',
    bankName: 'Unknown',
    transactionDate: e.sms.date,
    message: e.sms,
  }))

  // Unmatched candidates: parser-library bootstrap so new banks show up before
  // their pattern exists; reviewing them in the patterns screen creates one.
  const fromCandidates: Transaction[] = []
  for (const candidate of result.candidates) {
    const intent = candidate.type === TRANSACTION_TYPE.Credit ? 'income' : 'expense'
    const fields = SMSDataExtractor.extract(candidate.sms.body, intent)
    const amount = fields.amount?.value
    if (!amount || amount <= 0) continue

    fromCandidates.push({
      id: candidate.sms.id,
      amount,
      merchant: fields.merchant || 'Unknown',
      bankName: fields.bank?.name || 'Unknown',
      transactionDate: candidate.sms.date,
      message: candidate.sms,
    })
  }

  return [...fromPatterns, ...fromCandidates].sort((a, b) => a.transactionDate - b.transactionDate)
}

export function useSMSTransactions() {
  const query = useQuery({
    queryKey: ['sms-transactions'],
    queryFn: fetchSMSTransactions,
  })

  const errorMessage = query.error instanceof Error ? query.error.message : query.error ? 'Failed to load SMS' : null

  return {
    ...query,
    errorMessage,
  }
}
