import { formatRelativeDate } from './format-relative-date'

describe('formatRelativeDate', () => {
  const referenceDate = new Date('2024-12-15T10:00:00')

  it('returns "Today" for the current date', () => {
    const today = new Date('2024-12-15T14:30:00')
    expect(formatRelativeDate(today, referenceDate)).toBe('Today')
  })

  it('returns "Today" for the current date at midnight', () => {
    const todayMidnight = new Date('2024-12-15T00:00:00')
    expect(formatRelativeDate(todayMidnight, referenceDate)).toBe('Today')
  })

  it('returns "Yesterday" for the previous date', () => {
    const yesterday = new Date('2024-12-14T18:00:00')
    expect(formatRelativeDate(yesterday, referenceDate)).toBe('Yesterday')
  })

  it('returns "Yesterday" for the previous date at any time', () => {
    const yesterdayMorning = new Date('2024-12-14T06:00:00')
    expect(formatRelativeDate(yesterdayMorning, referenceDate)).toBe('Yesterday')
  })

  it('returns formatted date for dates older than yesterday', () => {
    const twoDaysAgo = new Date('2024-12-13T12:00:00')
    const result = formatRelativeDate(twoDaysAgo, referenceDate)
    expect(result).toMatch(/13\s*Dec/)
  })

  it('returns formatted date for dates in a different month', () => {
    const lastMonth = new Date('2024-11-20T12:00:00')
    const result = formatRelativeDate(lastMonth, referenceDate)
    expect(result).toMatch(/20\s*Nov/)
  })

  it('returns formatted date for future dates', () => {
    const tomorrow = new Date('2024-12-16T12:00:00')
    const result = formatRelativeDate(tomorrow, referenceDate)
    expect(result).toMatch(/16\s*Dec/)
  })

  it('uses current date as reference when not provided', () => {
    const today = new Date()
    expect(formatRelativeDate(today)).toBe('Today')
  })

  it('handles year boundary correctly', () => {
    const newYearRef = new Date('2025-01-01T10:00:00')
    const lastDayOfYear = new Date('2024-12-31T12:00:00')
    expect(formatRelativeDate(lastDayOfYear, newYearRef)).toBe('Yesterday')
  })
})
