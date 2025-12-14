import { getCurrentMonthRange } from './get-current-month-range'

describe('getCurrentMonthRange', () => {
  it('returns the first day of the current month as start', () => {
    const now = new Date(2024, 5, 15) // June 15, 2024
    const { start } = getCurrentMonthRange(now)

    expect(start.getFullYear()).toBe(2024)
    expect(start.getMonth()).toBe(5) // June (0-indexed)
    expect(start.getDate()).toBe(1)
  })

  it('returns the first day of the next month as end', () => {
    const now = new Date(2024, 5, 15) // June 15, 2024
    const { end } = getCurrentMonthRange(now)

    expect(end.getFullYear()).toBe(2024)
    expect(end.getMonth()).toBe(6) // July (0-indexed)
    expect(end.getDate()).toBe(1)
  })

  it('handles year boundary correctly for December', () => {
    const now = new Date(2024, 11, 25) // December 25, 2024
    const { start, end } = getCurrentMonthRange(now)

    expect(start.getFullYear()).toBe(2024)
    expect(start.getMonth()).toBe(11) // December
    expect(start.getDate()).toBe(1)

    expect(end.getFullYear()).toBe(2025)
    expect(end.getMonth()).toBe(0) // January
    expect(end.getDate()).toBe(1)
  })

  it('handles January correctly', () => {
    const now = new Date(2024, 0, 10) // January 10, 2024
    const { start, end } = getCurrentMonthRange(now)

    expect(start.getFullYear()).toBe(2024)
    expect(start.getMonth()).toBe(0) // January
    expect(start.getDate()).toBe(1)

    expect(end.getFullYear()).toBe(2024)
    expect(end.getMonth()).toBe(1) // February
    expect(end.getDate()).toBe(1)
  })

  it('works on the first day of the month', () => {
    const now = new Date(2024, 3, 1) // April 1, 2024
    const { start, end } = getCurrentMonthRange(now)

    expect(start.getTime()).toBe(now.getTime())
    expect(end.getMonth()).toBe(4) // May
  })

  it('works on the last day of the month', () => {
    const now = new Date(2024, 1, 29) // February 29, 2024 (leap year)
    const { start, end } = getCurrentMonthRange(now)

    expect(start.getMonth()).toBe(1) // February
    expect(start.getDate()).toBe(1)
    expect(end.getMonth()).toBe(2) // March
    expect(end.getDate()).toBe(1)
  })
})
