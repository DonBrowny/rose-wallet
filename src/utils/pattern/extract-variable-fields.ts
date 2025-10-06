export function extractVariableFields(sms: string): string[] {
  const fields: string[] = []

  // Extract amounts
  const amounts = sms.match(/\b\d+\.?\d*\b/g)
  if (amounts) fields.push(...amounts)

  // Extract dates
  const dates = sms.match(/\b\d{1,2}[\/\-]\w{3,9}[\/\-]?\d{0,4}\b/g)
  if (dates) fields.push(...dates)

  // Extract merchant names (uppercase words)
  const merchants = sms.match(/\b[A-Z]{2,}\b/g)
  if (merchants) fields.push(...merchants)

  // Extract reference numbers
  const refs = sms.match(/\b[A-Z0-9]{10,}\b/g)
  if (refs) fields.push(...refs)

  return [...new Set(fields)] // Remove duplicates
}
