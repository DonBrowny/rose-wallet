import { compileTemplateToRegex } from './compile-template-to-regex'

const HDFC_TEMPLATE =
  'Rs.<AMT> debited from a/c **1234 on 12-07-25 to VPA <MERCHANT> UPI Ref 123456789012. Avl Bal Rs.5,000.00 - HDFC Bank'

describe('compileTemplateToRegex', () => {
  it('produces a valid regex with named groups', () => {
    const { source, warnings } = compileTemplateToRegex(HDFC_TEMPLATE)
    expect(warnings).toEqual([])
    expect(() => new RegExp(source, 'i')).not.toThrow()
    expect(source).toContain('(?<amount>')
    expect(source).toContain('(?<merchant>')
  })

  it('matches messages where volatile literals (date, ref, balance, last4) differ', () => {
    const regex = new RegExp(compileTemplateToRegex(HDFC_TEMPLATE).source, 'i')
    const variant =
      'Rs.250 debited from a/c **9876 on 15-08-25 to VPA swiggy@icici UPI Ref 987654321098. Avl Bal Rs.12,345.67 - HDFC Bank'
    expect(regex.test(variant)).toBe(true)
  })

  it('does not match a structurally different message', () => {
    const regex = new RegExp(compileTemplateToRegex(HDFC_TEMPLATE).source, 'i')
    const credit =
      'Rs.250 credited to a/c **1234 on 15-08-25 from VPA someone@okabc UPI Ref 987654321098. Avl Bal Rs.12,345.67 - HDFC Bank'
    expect(regex.test(credit)).toBe(false)
  })

  it('tolerates whitespace variation', () => {
    const regex = new RegExp(compileTemplateToRegex('Paid Rs.<AMT> to <MERCHANT> via UPI').source, 'i')
    expect(regex.test('Paid Rs.99 to  Blinkit \n via UPI')).toBe(true)
  })

  it('generalizes mixed alphanumeric tokens like 12Jul25 dates', () => {
    const template = 'A/C X1234 debited by <AMT> on date 12Jul25 trf to <MERCHANT> Refno 123456789012. -SBI'
    const regex = new RegExp(compileTemplateToRegex(template).source, 'i')
    expect(regex.test('A/C X9999 debited by 35.0 on date 15Aug25 trf to PARKING PLAZA Refno 999888777666. -SBI')).toBe(
      true
    )
  })

  it('warns when placeholders have no anchoring text between them', () => {
    const { warnings } = compileTemplateToRegex('Rs.<AMT> <MERCHANT> thanks')
    expect(warnings.some((w) => w.includes('ambiguous'))).toBe(true)
  })

  it('warns on duplicate placeholders and still compiles', () => {
    const { source, warnings } = compileTemplateToRegex('Rs.<AMT> debited, total <AMT> spent')
    expect(warnings.some((w) => w.includes('duplicate'))).toBe(true)
    expect(() => new RegExp(source, 'i')).not.toThrow()
  })

  it('warns when the template has no amount placeholder', () => {
    const { warnings } = compileTemplateToRegex('You paid <MERCHANT> successfully')
    expect(warnings.some((w) => w.includes('<AMT>'))).toBe(true)
  })
})
