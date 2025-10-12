import { formatCurrency } from './format-currency'

function normalizeCurrency(output: string): string {
  return output.replace(/\s/g, '').replace('₹', '₹')
}

describe('formatCurrency', () => {
  it('formats integer amounts without decimals by default', () => {
    expect(normalizeCurrency(formatCurrency(0))).toBe('₹0')
    expect(normalizeCurrency(formatCurrency(1))).toBe('₹1')
    expect(normalizeCurrency(formatCurrency(10.49))).toBe('₹10.49')
    expect(normalizeCurrency(formatCurrency(1000))).toBe('₹1,000')
    expect(normalizeCurrency(formatCurrency(3200))).toBe('₹3,200')
  })

  it('formats with Indian numbering system for large values', () => {
    expect(normalizeCurrency(formatCurrency(123456))).toBe('₹1,23,456')
    expect(normalizeCurrency(formatCurrency(12345678))).toBe('₹1,23,45,678')
  })

  it('rounds and shows two decimals when roundToTwoDecimals is true', () => {
    expect(normalizeCurrency(formatCurrency(10, true))).toBe('₹10.00')
    expect(normalizeCurrency(formatCurrency(10.1, true))).toBe('₹10.10')
    expect(normalizeCurrency(formatCurrency(10.129, true))).toBe('₹10.13')
    expect(normalizeCurrency(formatCurrency(10.124, true))).toBe('₹10.12')
  })
})
