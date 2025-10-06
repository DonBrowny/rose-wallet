export function parseDate(dateText?: string): Date | null {
  if (!dateText) return null

  // Try common date formats
  const formats = [
    /(\d{1,2})[\/\-](\w{3,9})[\/\-]?(\d{2,4})/i, // 07Jul25, 07/Jul/25
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i, // 07/07/25, 07-07-25
  ]

  for (const format of formats) {
    const match = dateText.match(format)
    if (match) {
      try {
        const day = parseInt(match[1])
        const month = match[2]
        const year = parseInt(match[3])

        // Handle 2-digit years
        const fullYear = year < 100 ? 2000 + year : year

        // Parse month
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        const monthIndex = monthNames.findIndex((m) => m.toLowerCase() === month.toLowerCase())
        const monthNum = monthIndex >= 0 ? monthIndex : parseInt(month) - 1

        return new Date(fullYear, monthNum, day)
      } catch {
        continue
      }
    }
  }

  return null
}
