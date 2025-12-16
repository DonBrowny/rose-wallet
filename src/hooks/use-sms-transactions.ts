import type { Pattern } from '@/db/schema'
import { SMSDataExtractor } from '@/services/sms-parsing/sms-data-extractor-service'
import { SMSIntentService } from '@/services/sms-parsing/sms-intent-service'
import { SMSService } from '@/services/sms-parsing/sms-service'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import type { SMSMessage, Transaction } from '@/types/sms/transaction'
import { storage } from '@/utils/mmkv/storage'
import { getPatterns } from '@/utils/pattern/get-patterns'
import { matchPatternAndExtract } from '@/utils/pattern/match-pattern-and-extract'
import { matchesRejectedPattern } from '@/utils/pattern/matches-rejected-pattern'
import { useQuery } from '@tanstack/react-query'

function getOneMonthAgoTimestamp(): number {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.getTime()
}

async function processSMS(
  sms: SMSMessage,
  activePatterns: Pattern[],
  rejectedPatterns: Pattern[],
  intentService: SMSIntentService
): Promise<Transaction | null> {
  // Skip if matches rejected pattern
  if (matchesRejectedPattern(sms.body, rejectedPatterns)) {
    return null
  }

  // Try pattern matching first (faster than ML)
  const patternResult = matchPatternAndExtract(sms.body, activePatterns)
  if (patternResult.patternId && patternResult.amount) {
    const amount = Number(patternResult.amount)
    if (Number.isFinite(amount) && amount > 0) {
      return {
        id: sms.id,
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
        id: sms.id,
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

async function fetchSMSTransactions(): Promise<Transaction[]> {
  const lastRead = storage.getNumber(MMKV_KEYS.SMS.LAST_READ_AT)
  const startTimestamp = typeof lastRead === 'number' ? lastRead : getOneMonthAgoTimestamp()
  const endTimestamp = Date.now()

  // Step 1: Get transactional SMS (pre-filtered by sender format)
  const result = await SMSService.getTransactionalSMS({ startTimestamp, endTimestamp })

  if (!result.success) {
    throw new Error(result.errors[0] || 'Failed to load SMS')
  }

  // Step 2: Fetch all patterns once
  const { active: activePatterns, rejected: rejectedPatterns } = await getPatterns()

  // Step 3: Initialize ML service once
  const intentService = SMSIntentService.getInstance()
  await intentService.init()

  // Step 4: Process all SMS - pattern match first, then ML fallback
  const results = await Promise.all(
    result.sms.map((sms) => processSMS(sms, activePatterns, rejectedPatterns, intentService))
  )

  // Step 5: Filter out nulls and sort by date (oldest first)
  return results.filter((tx): tx is Transaction => tx !== null).sort((a, b) => a.transactionDate - b.transactionDate)
}

export function useSMSTransactions() {
  const query = useQuery({
    queryKey: ['sms-transactions'],
    queryFn: fetchSMSTransactions,
    gcTime: 0,
  })

  const errorMessage = query.error instanceof Error ? query.error.message : query.error ? 'Failed to load SMS' : null

  return {
    ...query,
    errorMessage,
  }
}
