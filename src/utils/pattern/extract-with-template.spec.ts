import { extractWithTemplate } from './extract-with-template'

const HDFC_TEMPLATE =
  'Rs.<AMT> debited from a/c **1234 on 12-07-25 to VPA <MERCHANT> UPI Ref 123456789012. Avl Bal Rs.5,000.00 - HDFC Bank'

const ICICI_TEMPLATE =
  'INR <AMT> spent using ICICI Bank Card XX9004 on 10-Jul-26 on <MERCHANT>. Avl Limit: INR 2,28,386.18. If not you, call 1800 2662/SMS BLOCK 9004 to 9215676766.'

describe('extractWithTemplate', () => {
  it('extracts amount and merchant from a matching message', () => {
    const sms =
      'Rs.250 debited from a/c **1234 on 15-08-25 to VPA swiggy@icici UPI Ref 987654321098. Avl Bal Rs.3,750.25 - HDFC Bank'
    expect(extractWithTemplate(HDFC_TEMPLATE, sms)).toEqual({ amount: 250, merchantRaw: 'swiggy@icici' })
  })

  it('parses comma-grouped amounts', () => {
    const sms =
      'Rs.1,23,456.78 debited from a/c **1234 on 15-08-25 to VPA dealer@hdfcbank UPI Ref 987654321098. Avl Bal Rs.3,750.25 - HDFC Bank'
    expect(extractWithTemplate(HDFC_TEMPLATE, sms)?.amount).toBe(123456.78)
  })

  it('extracts across month boundaries: a July template reads a May message', () => {
    const sms =
      'INR 548.00 spent using ICICI Bank Card XX9004 on 29-May-26 on WWW AIRTEL. Avl Limit: INR 2,31,752.16. If not you, call 1800 2662/SMS BLOCK 9004 to 9215676766.'
    expect(extractWithTemplate(ICICI_TEMPLATE, sms)).toEqual({ amount: 548, merchantRaw: 'WWW AIRTEL' })
  })

  it('tolerates drift in every digit-bearing token at once (card, date, limit, callback numbers)', () => {
    const sms =
      'INR 1,299.00 spent using ICICI Bank Card XX1234 on 02-Jan-27 on SWIGGY. Avl Limit: INR 90,000.00. If not you, call 1800 9999/SMS BLOCK 1234 to 9999999999.'
    expect(extractWithTemplate(ICICI_TEMPLATE, sms)).toEqual({ amount: 1299, merchantRaw: 'SWIGGY' })
  })

  it('extracts a merchant whose words also appear as template literals', () => {
    const sms =
      'INR 750.00 spent using ICICI Bank Card XX9004 on 01-Jun-26 on ICICI BANK INSURANCE. Avl Limit: INR 1,00,000.00. If not you, call 1800 2662/SMS BLOCK 9004 to 9215676766.'
    expect(extractWithTemplate(ICICI_TEMPLATE, sms)).toEqual({ amount: 750, merchantRaw: 'ICICI BANK INSURANCE' })
  })

  it('extracts multi-word merchants bounded by literal anchors', () => {
    const template = 'A/C X1234 debited by <AMT> on date 12Jul25 trf to <MERCHANT> Refno 123456789012. -SBI'
    const sms = 'A/C X9999 debited by 35.0 on date 15Aug25 trf to PARKING PLAZA Refno 999888777666. -SBI'
    expect(extractWithTemplate(template, sms)).toEqual({ amount: 35, merchantRaw: 'PARKING PLAZA' })
  })

  it('extracts a merchant at the end of the message without trailing whitespace', () => {
    expect(extractWithTemplate('Paid Rs.<AMT> to <MERCHANT>', 'Paid Rs.99 to Blinkit  ')).toEqual({
      amount: 99,
      merchantRaw: 'Blinkit',
    })
  })

  it('reads a multi-line message against a single-line template', () => {
    const sms =
      'INR 548.00 spent using ICICI Bank Card XX9004\non 29-May-26 on WWW AIRTEL.\nAvl Limit: INR 2,31,752.16.\nIf not you, call 1800 2662/SMS BLOCK 9004 to 9215676766.'
    expect(extractWithTemplate(ICICI_TEMPLATE, sms)).toEqual({ amount: 548, merchantRaw: 'WWW AIRTEL' })
  })

  it('tolerates a date changing shape into multiple tokens (29-May-26 → 29 May 26)', () => {
    const sms =
      'INR 548.00 spent using ICICI Bank Card XX9004 on 29 May 26 on WWW AIRTEL. Avl Limit: INR 2,31,752.16. If not you, call 1800 2662/SMS BLOCK 9004 to 9215676766.'
    expect(extractWithTemplate(ICICI_TEMPLATE, sms)).toEqual({ amount: 548, merchantRaw: 'WWW AIRTEL' })
  })

  it('tolerates volatile tokens shrinking or growing (8-12-25 for 12-07-25, Ref 55 for a 12-digit ref)', () => {
    const sms =
      'Rs.8 debited from a/c **1234 on 8-12-25 to VPA swiggy@icici UPI Ref 55. Avl Bal Rs.3,750.25 - HDFC Bank'
    expect(extractWithTemplate(HDFC_TEMPLATE, sms)).toEqual({ amount: 8, merchantRaw: 'swiggy@icici' })
  })

  it('rejects a truncated message', () => {
    expect(extractWithTemplate(ICICI_TEMPLATE, 'INR 548.00 spent using ICICI Bank Card XX9004 on 29-May')).toBeNull()
  })

  it('strips a fused rupee symbol from the amount', () => {
    expect(
      extractWithTemplate('Sent ₹<AMT> to <MERCHANT> via UPI Ref 5551', 'Sent ₹1,299.00 to Uber Rides via UPI Ref 9982')
    ).toEqual({
      amount: 1299,
      merchantRaw: 'Uber Rides',
    })
  })

  it('strips punctuation on both sides of a placeholder', () => {
    const template = 'You spent Rs.<AMT>. Bal Rs.900 on card **4291 at <MERCHANT>'
    expect(extractWithTemplate(template, 'You spent Rs.99. Bal Rs.500 on card **4291 at DMart')).toEqual({
      amount: 99,
      merchantRaw: 'DMart',
    })
  })

  it('matches template literals case-insensitively', () => {
    const sms =
      'RS.250 DEBITED FROM A/C **1234 ON 15-08-25 TO VPA SWIGGY@ICICI UPI REF 987654321098. AVL BAL RS.3,750.25 - HDFC BANK'
    expect(extractWithTemplate(HDFC_TEMPLATE, sms)).toEqual({ amount: 250, merchantRaw: 'SWIGGY@ICICI' })
  })

  it('rejects a structurally different message (credited vs debited)', () => {
    const sms =
      'Rs.250 credited to a/c **1234 on 15-08-25 from VPA someone@okabc UPI Ref 987654321098. Avl Bal Rs.3,750.25 - HDFC Bank'
    expect(extractWithTemplate(HDFC_TEMPLATE, sms)).toBeNull()
  })

  it('rejects a message that flips a single word even when everything else aligns', () => {
    const sms =
      'Rs.250 credited from a/c **1234 on 15-08-25 to VPA swiggy@icici UPI Ref 987654321098. Avl Bal Rs.3,750.25 - HDFC Bank'
    expect(extractWithTemplate(HDFC_TEMPLATE, sms)).toBeNull()
  })

  it('rejects a message with an inserted word', () => {
    const sms =
      'Rs.250 debited from your a/c **1234 on 15-08-25 to VPA swiggy@icici UPI Ref 987654321098. Avl Bal Rs.3,750.25 - HDFC Bank'
    expect(extractWithTemplate(HDFC_TEMPLATE, sms)).toBeNull()
  })

  it('rejects an unrelated message from another bank', () => {
    const sms = 'Flat 50% off! Order now for just Rs.99. T&C apply.'
    expect(extractWithTemplate(ICICI_TEMPLATE, sms)).toBeNull()
  })

  it('returns null when the matched amount is not a valid value', () => {
    const sms =
      'Rs.0 debited from a/c **1234 on 15-08-25 to VPA swiggy@icici UPI Ref 987654321098. Avl Bal Rs.3,750.25 - HDFC Bank'
    expect(extractWithTemplate(HDFC_TEMPLATE, sms)).toBeNull()
  })

  it('returns null when the merchant slot captures nothing', () => {
    const sms =
      'Rs.250 debited from a/c **1234 on 15-08-25 to VPA UPI Ref 987654321098. Avl Bal Rs.3,750.25 - HDFC Bank'
    expect(extractWithTemplate(HDFC_TEMPLATE, sms)).toBeNull()
  })

  it('returns null for adjacent placeholders with no anchor between them', () => {
    expect(extractWithTemplate('Paid <AMT> <MERCHANT> today', 'Paid 250 Swiggy today')).toBeNull()
  })

  it('returns null for empty input', () => {
    expect(extractWithTemplate('', 'any message')).toBeNull()
    expect(extractWithTemplate(HDFC_TEMPLATE, '')).toBeNull()
  })

  it('extracts merchant only when the template has no amount placeholder', () => {
    expect(extractWithTemplate('You paid <MERCHANT> successfully', 'You paid Zomato successfully')).toEqual({
      merchantRaw: 'Zomato',
    })
  })
})
