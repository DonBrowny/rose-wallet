export function determinePatternType(sms: string): 'DEBIT' | 'CREDIT' {
  const upperSms = sms.toUpperCase()

  // Check for debit keywords
  if (
    upperSms.includes('DEBITED') ||
    upperSms.includes('SPENT') ||
    upperSms.includes('PAID') ||
    upperSms.includes('PURCHASE') ||
    upperSms.includes('WITHDRAWAL')
  ) {
    return 'DEBIT'
  }

  // Check for credit keywords
  if (
    upperSms.includes('CREDITED') ||
    upperSms.includes('RECEIVED') ||
    upperSms.includes('DEPOSIT') ||
    upperSms.includes('REFUND')
  ) {
    return 'CREDIT'
  }

  // Default to debit for most transaction SMS
  return 'DEBIT'
}
