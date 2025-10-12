import { formatLargeCurrency } from './format-large-currency'

describe('formatLargeCurrency', () => {
  it.each<[number, string]>([
    [0, '₹0'],
    [999, '₹999'],
    [1000, '₹1,000'],
    [99999, '₹99,999'],
    [10.49, '₹10'],
    [10.5, '₹11'],
    [100000, '₹1.00 L'],
    [125000, '₹1.25 L'],
    [999999, '₹10.00 L'],
    [10000000, '₹1.00 Cr'],
    [12500000, '₹1.25 Cr'],
    [99999999, '₹10.00 Cr'],
  ])('formats %p as %p', (amount, expected) => {
    expect(formatLargeCurrency(amount)).toBe(expected)
  })
})
