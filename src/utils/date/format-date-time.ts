const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

/**
 * Formats a date to "dd-mmm HH:MM" format (24 hour)
 * Example: "15-Dec 14:30"
 */
export function formatDateTime(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = MONTHS[date.getMonth()]
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${day}-${month} ${hours}:${minutes}`
}
