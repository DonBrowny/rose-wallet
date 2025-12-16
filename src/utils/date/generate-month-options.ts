export interface MonthOption {
  year: number
  month: number
  label: string
  isCurrentMonth: boolean
}

const MIN_YEAR = 2025
const MIN_MONTH = 4 // May (0-indexed)

function getMonthLabel(index: number, year: number, month: number): string {
  if (index === 0) return 'This Month'
  if (index === 1) return 'Last Month'
  return new Date(year, month, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function calculateMonthDiff(fromYear: number, fromMonth: number, toYear: number, toMonth: number): number {
  return (fromYear - toYear) * 12 + (fromMonth - toMonth) + 1
}

export function generateMonthOptions(): MonthOption[] {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const monthCount = calculateMonthDiff(currentYear, currentMonth, MIN_YEAR, MIN_MONTH)

  return Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(currentYear, currentMonth - index, 1)
    const year = date.getFullYear()
    const month = date.getMonth()

    return {
      year,
      month,
      label: getMonthLabel(index, year, month),
      isCurrentMonth: index === 0,
    }
  })
}
