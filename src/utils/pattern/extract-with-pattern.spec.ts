import { compileTemplateToRegex } from './compile-template-to-regex'
import { extractWithPattern } from './extract-with-pattern'

const HDFC_TEMPLATE =
  'Rs.<AMT> debited from a/c **1234 on 12-07-25 to VPA <MERCHANT> UPI Ref 123456789012. Avl Bal Rs.5,000.00 - HDFC Bank'
const HDFC_REGEX = compileTemplateToRegex(HDFC_TEMPLATE).source

describe('extractWithPattern', () => {
  it('extracts amount and merchant from a matching message', () => {
    const sms =
      'Rs.250 debited from a/c **1234 on 15-08-25 to VPA swiggy@icici UPI Ref 987654321098. Avl Bal Rs.3,750.25 - HDFC Bank'
    expect(extractWithPattern(HDFC_REGEX, sms)).toEqual({ amount: 250, merchantRaw: 'swiggy@icici' })
  })

  it('parses comma-grouped amounts', () => {
    const sms =
      'Rs.1,23,456.78 debited from a/c **1234 on 15-08-25 to VPA dealer@hdfcbank UPI Ref 987654321098. Avl Bal Rs.3,750.25 - HDFC Bank'
    expect(extractWithPattern(HDFC_REGEX, sms)?.amount).toBe(123456.78)
  })

  it('extracts multi-word merchants bounded by literal anchors', () => {
    const template = 'A/C X1234 debited by <AMT> on date 12Jul25 trf to <MERCHANT> Refno 123456789012. -SBI'
    const sms = 'A/C X9999 debited by 35.0 on date 15Aug25 trf to PARKING PLAZA Refno 999888777666. -SBI'
    expect(extractWithPattern(compileTemplateToRegex(template).source, sms)).toEqual({
      amount: 35,
      merchantRaw: 'PARKING PLAZA',
    })
  })

  it('extracts a merchant at the end of the message without trailing whitespace', () => {
    const template = 'Paid Rs.<AMT> to <MERCHANT>'
    expect(extractWithPattern(compileTemplateToRegex(template).source, 'Paid Rs.99 to Blinkit  ')).toEqual({
      amount: 99,
      merchantRaw: 'Blinkit',
    })
  })

  it('returns null for a structurally different message', () => {
    const sms =
      'Rs.250 credited to a/c **1234 on 15-08-25 from VPA someone@okabc UPI Ref 987654321098. Avl Bal Rs.3,750.25 - HDFC Bank'
    expect(extractWithPattern(HDFC_REGEX, sms)).toBeNull()
  })

  it('returns null when the matched amount is not a valid value', () => {
    const sms =
      'Rs.0 debited from a/c **1234 on 15-08-25 to VPA swiggy@icici UPI Ref 987654321098. Avl Bal Rs.3,750.25 - HDFC Bank'
    expect(extractWithPattern(HDFC_REGEX, sms)).toBeNull()
  })

  it('returns null for an invalid regex source or empty input', () => {
    expect(extractWithPattern('([', 'any message')).toBeNull()
    expect(extractWithPattern('', 'any message')).toBeNull()
    expect(extractWithPattern(HDFC_REGEX, '')).toBeNull()
  })

  it('extracts merchant only when the template has no amount placeholder', () => {
    const template = 'You paid <MERCHANT> successfully'
    expect(extractWithPattern(compileTemplateToRegex(template).source, 'You paid Zomato successfully')).toEqual({
      merchantRaw: 'Zomato',
    })
  })
})
