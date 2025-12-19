export interface MonthRange {
  start: Date
  end: Date
}

export function getMonthRange(year: number, month: number): MonthRange {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
  return { start, end }
}
