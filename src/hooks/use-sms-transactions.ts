import type { Pattern } from '@/db/schema'
import { SMSDataExtractor } from '@/services/sms-parsing/sms-data-extractor-service'
import { SMSIntentService } from '@/services/sms-parsing/sms-intent-service'
import { SMSService } from '@/services/sms-parsing/sms-service'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import type { SMSMessage, Transaction } from '@/types/sms/transaction'
import { storage } from '@/utils/mmkv/storage'
import { getActivePatterns } from '@/utils/pattern/get-active-patterns'
import { getRejectedPatterns } from '@/utils/pattern/get-rejected-patterns'
import { matchPatternAndExtract } from '@/utils/pattern/match-pattern-and-extract'
import { matchesRejectedPattern } from '@/utils/pattern/matches-rejected-pattern'
import { useQuery } from '@tanstack/react-query'

function getThreeMonthsAgoTimestamp(): number {
  const d = new Date()
  d.setMonth(d.getMonth() - 3)
  return d.getTime()
}

async function enrichTransactionsWithPatterns(list: Transaction[], patterns: Pattern[]): Promise<Transaction[]> {
  return Promise.all(
    list.map(async (tx) => {
      try {
        const result = await matchPatternAndExtract(tx.message.body, patterns)
        return {
          ...tx,
          amount: typeof result.amount === 'number' && !Number.isNaN(result.amount) ? result.amount : tx.amount,
          merchant: result.merchant || tx.merchant,
        }
      } catch {
        return tx
      }
    })
  )
}

async function classifyAndExtractTransactions(messages: SMSMessage[]): Promise<Transaction[]> {
  const intentService = SMSIntentService.getInstance()
  await intentService.init()

  const transactions: Transaction[] = []

  for (const sms of messages) {
    try {
      const intentResult = await intentService.classify(sms.body)

      if (intentResult.label === 'not_txn') {
        continue
      }

      const extractedData = SMSDataExtractor.extract(sms.body, intentResult.label)

      if (extractedData.amount && extractedData.amount.value > 0) {
        transactions.push({
          id: sms.id,
          amount: extractedData.amount.value,
          merchant: extractedData.merchant || 'Unknown',
          bankName: extractedData.bank?.name || 'Unknown',
          transactionDate: sms.date,
          message: sms,
        })
      }
    } catch (error) {
      console.warn(`Failed to process SMS ${sms.id}:`, error)
    }
  }

  return transactions
}

async function fetchSMSTransactions(): Promise<Transaction[]> {
  const lastRead = storage.getNumber(MMKV_KEYS.SMS.LAST_READ_AT)
  const startTimestamp = typeof lastRead === 'number' ? lastRead : getThreeMonthsAgoTimestamp()
  const endTimestamp = Date.now()

  // Step 1: Get transactional SMS (pre-filtered by sender format)
  const result = await SMSService.getTransactionalSMS({ startTimestamp, endTimestamp })

  if (!result.success) {
    throw new Error(result.errors[0] || 'Failed to load SMS')
  }

  // Step 2: Fetch patterns once for filtering and enrichment
  const [activePatterns, rejectedPatterns] = await Promise.all([getActivePatterns(), getRejectedPatterns()])

  // Step 3: Filter out SMS that match rejected patterns
  const filteredMessages = result.sms.filter((sms) => !matchesRejectedPattern(sms.body, rejectedPatterns))

  // Step 4: Classify with ML and extract transaction data
  const transactions = await classifyAndExtractTransactions(filteredMessages)

  // Step 5: Enrich with pattern-based extraction
  return enrichTransactionsWithPatterns(transactions, activePatterns)
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
