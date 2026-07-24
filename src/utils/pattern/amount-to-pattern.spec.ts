import { amountToPattern } from './amount-to-pattern'

describe('amountToPattern', () => {
  it('matches the plain integer form', () => {
    expect(amountToPattern(1500)?.test('Rs.1500 debited')).toBe(true)
  })

  it('matches Indian comma grouping', () => {
    expect(amountToPattern(1500)?.test('Rs.1,500 debited')).toBe(true)
    expect(amountToPattern(123456.78)?.test('Rs.1,23,456.78 debited')).toBe(true)
  })

  it('matches optional decimals for whole amounts', () => {
    const pattern = amountToPattern(1500)
    expect(pattern?.test('Rs.1,500.00 debited')).toBe(true)
    expect(pattern?.test('Rs.1500.0 debited')).toBe(true)
  })

  it('requires the fraction when the amount has paise', () => {
    const pattern = amountToPattern(500.5)
    expect(pattern?.test('debited by 500.50')).toBe(true)
    expect(pattern?.test('debited by 500.5')).toBe(true)
    expect(pattern?.test('debited by 500')).toBe(false)
  })

  it('does not match inside a larger number', () => {
    const pattern = amountToPattern(1500)
    expect(pattern?.test('Avl Bal Rs.11,500')).toBe(false)
    expect(pattern?.test('ref 31500')).toBe(false)
    expect(pattern?.test('ref 15000')).toBe(false)
  })

  it('returns null for invalid amounts', () => {
    expect(amountToPattern(0)).toBeNull()
    expect(amountToPattern(-10)).toBeNull()
    expect(amountToPattern(Number.NaN)).toBeNull()
  })

  it('locates the amount for placeholder replacement', () => {
    const sms = 'Rs.1,500.00 debited from a/c **1234. Avl Bal Rs.5,000.00'
    const replaced = sms.replace(amountToPattern(1500)!, '<AMT>')
    expect(replaced).toBe('Rs.<AMT> debited from a/c **1234. Avl Bal Rs.5,000.00')
  })
})
