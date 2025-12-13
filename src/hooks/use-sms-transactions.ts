import type { Pattern } from '@/db/schema'
import { SMSDataExtractor } from '@/services/sms-parsing/sms-data-extractor-service'
import { SMSIntentService } from '@/services/sms-parsing/sms-intent-service'
import { SMSService } from '@/services/sms-parsing/sms-service'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import type { SMSMessage, SMSTransaction } from '@/types/sms/transaction'
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

async function processSMS(
  sms: SMSMessage,
  activePatterns: Pattern[],
  rejectedPatterns: Pattern[],
  intentService: SMSIntentService
): Promise<SMSTransaction | null> {
  // Skip if matches rejected pattern
  if (matchesRejectedPattern(sms.body, rejectedPatterns)) {
    return null
  }

  // Try pattern matching first (faster than ML)
  const patternResult = await matchPatternAndExtract(sms.body, activePatterns)
  if (patternResult.patternName && patternResult.amount) {
    const amount = Number(patternResult.amount)
    if (Number.isFinite(amount) && amount > 0) {
      return {
        smsId: sms.id,
        patternId: patternResult.patternId,
        amount,
        merchant: patternResult.merchant || 'Unknown',
        bankName: 'Unknown',
        transactionDate: sms.date,
        message: sms,
      }
    }
  }

  // Fall back to ML classification
  try {
    const intentResult = await intentService.classify(sms.body)
    if (intentResult.label === 'not_txn') {
      return null
    }

    const extractedData = SMSDataExtractor.extract(sms.body, intentResult.label)
    if (extractedData.amount && extractedData.amount.value > 0) {
      return {
        smsId: sms.id,
        amount: extractedData.amount.value,
        merchant: extractedData.merchant || 'Unknown',
        bankName: extractedData.bank?.name || 'Unknown',
        transactionDate: sms.date,
        message: sms,
      }
    }
  } catch (error) {
    console.warn(`Failed to process SMS ${sms.id}:`, error)
  }

  return null
}

async function fetchSMSTransactions(): Promise<SMSTransaction[]> {
  const lastRead = storage.getNumber(MMKV_KEYS.SMS.LAST_READ_AT)
  const startTimestamp = typeof lastRead === 'number' ? lastRead : getThreeMonthsAgoTimestamp()
  const endTimestamp = Date.now()

  // Step 1: Get transactional SMS (pre-filtered by sender format)
  const result = await SMSService.getTransactionalSMS({ startTimestamp, endTimestamp })

  if (!result.success) {
    throw new Error(result.errors[0] || 'Failed to load SMS')
  }

  // Step 2: Fetch all patterns once
  const [activePatterns, rejectedPatterns] = await Promise.all([getActivePatterns(), getRejectedPatterns()])

  // Step 3: Initialize ML service once
  const intentService = SMSIntentService.getInstance()
  await intentService.init()

  // Step 4: Process all SMS - pattern match first, then ML fallback
  const results = await Promise.all(
    result.sms.map((sms) => processSMS(sms, activePatterns, rejectedPatterns, intentService))
  )

  // Step 5: Filter out nulls
  return results.filter((tx): tx is SMSTransaction => tx !== null)
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
