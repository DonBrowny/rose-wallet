export function normalizeSMSTemplate(sms: string): string {
  return sms
    .replace(/\b\d+\.?\d*\b/g, 'AMOUNT') // Replace amounts
    .replace(/\b\d{1,2}[\/\-]\w{3,9}[\/\-]?\d{0,4}\b/g, 'DATE') // Replace dates
    .replace(/\b[A-Z]{2,}\b/g, 'MERCHANT') // Replace merchant names
    .replace(/\b[A-Z0-9]{10,}\b/g, 'REFERENCE') // Replace reference numbers
    .replace(/\b\d{4,}\b/g, 'ACCOUNT') // Replace account numbers
    .replace(/\b\d{10,}\b/g, 'PHONE') // Replace phone numbers
    .trim()
}
