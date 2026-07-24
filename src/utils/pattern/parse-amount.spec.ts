import { parseAmount } from './parse-amount'

describe('parseAmount', () => {
  it('parses plain amounts', () => {
    expect(parseAmount('250')).toBe(250)
    expect(parseAmount('35.0')).toBe(35)
  })

  it('parses Indian comma grouping', () => {
    expect(parseAmount('1,500.00')).toBe(1500)
    expect(parseAmount('1,23,456.78')).toBe(123456.78)
  })

  it('tolerates surrounding whitespace', () => {
    expect(parseAmount(' 250 ')).toBe(250)
  })

  it('rejects zero and non-numeric input', () => {
    expect(parseAmount('0')).toBeNull()
    expect(parseAmount('0.00')).toBeNull()
    expect(parseAmount('')).toBeNull()
    expect(parseAmount('abc')).toBeNull()
    expect(parseAmount('12abc')).toBeNull()
    expect(parseAmount('-50')).toBeNull()
  })
})
