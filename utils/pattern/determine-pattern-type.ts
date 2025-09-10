export function determinePatternType(sms: string): string {
  const upperSms = sms.toUpperCase()

  if (upperSms.includes('UPI')) return 'UPI_TRANSACTION'
  if (upperSms.includes('CARD')) return 'CARD_TRANSACTION'
  if (upperSms.includes('ATM')) return 'ATM_TRANSACTION'
  if (upperSms.includes('IMPS')) return 'IMPS_TRANSACTION'
  if (upperSms.includes('NEFT')) return 'NEFT_TRANSACTION'
  if (upperSms.includes('RTGS')) return 'RTGS_TRANSACTION'
  if (upperSms.includes('EMI')) return 'EMI_TRANSACTION'
  if (upperSms.includes('SIP')) return 'SIP_TRANSACTION'

  return 'GENERAL_TRANSACTION'
}
