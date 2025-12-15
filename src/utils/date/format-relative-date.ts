export function formatRelativeDate(date: Date, referenceDate: Date = new Date()): string {
  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const inputDate = new Date(date)
  inputDate.setHours(0, 0, 0, 0)

  if (inputDate.getTime() === today.getTime()) {
    return 'Today'
  }
  if (inputDate.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  }
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
