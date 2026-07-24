import { TRANSACTION_TYPE, type TransactionType } from '@/db/schema'

const RX_FAILURE = /\b(failed|declined|rejected|unsuccessful|could\s+not\s+be\s+processed)\b/i
const RX_FUTURE =
  /\b(will\s+be\s+(?:debited|credited|charged)|scheduled\s+(?:on|for)|autopay|auto[-\s]?pay|standing\s+instruction|due\s+(?:on|by)|payment\s+reminder)\b/i
const RX_DEBIT_VERB = /\b(debited|paid|spent|purchased?|withdraw(?:n|al)|sent|transferred|charged|deducted)\b/i
const RX_CREDIT_VERB = /\b(credited|received|refund(?:ed)?|cashback|reversed)\b/i
const RX_AMOUNT_CUE =
  /(?:₹|rs\.?|inr)\s*\d|\b\d[\d,]*(?:\.\d{1,2})?\s*(?:inr|rs)\b|\b(?:debited|credited|paid|received|charged)\s+(?:by|of|for|with)?\s*(?:₹|rs\.?|inr)?\s*\d/i

/**
 * Cheap rule-based triage: does this SMS look like a completed transaction?
 * Returns the transaction direction, or null for OTPs, promos, balance alerts,
 * failures, and future/scheduled payments. Deliberately permissive — a false
 * positive becomes a pattern the user rejects once; a false negative is invisible.
 */
export function isTransactionCandidate(smsBody: string): TransactionType | null {
  const body = String(smsBody ?? '')
  if (!body.trim()) return null

  if (RX_FAILURE.test(body)) return null
  if (RX_FUTURE.test(body)) return null
  if (!RX_AMOUNT_CUE.test(body)) return null

  if (RX_DEBIT_VERB.test(body)) return TRANSACTION_TYPE.Debit
  if (RX_CREDIT_VERB.test(body)) return TRANSACTION_TYPE.Credit
  return null
}
