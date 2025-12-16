import { formatDateTime } from './format-date-time'

describe('formatDateTime', () => {
  it('formats date with single digit day', () => {
    const date = new Date('2024-12-05T09:30:00')
    expect(formatDateTime(date)).toBe('05-Dec 09:30')
  })

  it('formats date with double digit day', () => {
    const date = new Date('2024-12-15T14:30:00')
    expect(formatDateTime(date)).toBe('15-Dec 14:30')
  })

  it('formats midnight correctly', () => {
    const date = new Date('2024-12-15T00:00:00')
    expect(formatDateTime(date)).toBe('15-Dec 00:00')
  })

  it('formats end of day correctly', () => {
    const date = new Date('2024-12-15T23:59:00')
    expect(formatDateTime(date)).toBe('15-Dec 23:59')
  })

  it('formats January correctly', () => {
    const date = new Date('2024-01-01T12:00:00')
    expect(formatDateTime(date)).toBe('01-Jan 12:00')
  })

  it('formats different months correctly', () => {
    expect(formatDateTime(new Date('2024-02-15T10:00:00'))).toBe('15-Feb 10:00')
    expect(formatDateTime(new Date('2024-06-20T15:45:00'))).toBe('20-Jun 15:45')
    expect(formatDateTime(new Date('2024-11-30T08:15:00'))).toBe('30-Nov 08:15')
  })

  it('pads single digit hours and minutes', () => {
    const date = new Date('2024-12-05T05:05:00')
    expect(formatDateTime(date)).toBe('05-Dec 05:05')
  })
})
