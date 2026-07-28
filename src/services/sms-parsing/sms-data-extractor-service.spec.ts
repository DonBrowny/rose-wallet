import { SMSDataExtractor } from './sms-data-extractor-service'

describe('SMSDataExtractorService', () => {
  it('returns non-transaction for not_txn intent', () => {
    const res = SMSDataExtractor.extract('random promo message', 'not_txn')
    expect(res.isTransaction).toBe(false)
    expect(res.intent).toBe('not_txn')
    expect(res.amount).toBeUndefined()
    expect(res.raw.amounts).toEqual([])
  })

  it('extracts debit amount, bank, merchant for expense', () => {
    const sms = 'Your a/c was debited by INR 1,250 at SWIGGY on 12/10/2025. Avl bal 20,000.'
    const res = SMSDataExtractor.extract(sms, 'expense')
    expect(res.isTransaction).toBe(true)
    expect(res.intent).toBe('expense')
    expect(res.amount?.value).toBe(1250)
    expect(res.amount?.currency).toBe('INR')
    expect(res.merchant).toBe('SWIGGY')
    // bank heuristics absent here (no bank word), may be undefined
    expect(res.bank?.name === 'SBI' || res.bank === undefined).toBe(true)
    expect(res.datetimeText).toBeDefined()
    expect(res.confidence).toBeGreaterThanOrEqual(0.4)
  })

  it('extracts credit amount for income', () => {
    const sms = 'Amount credited Rs. 5,000 from EMPLOYER on 01-Jan-2025. Avl bal 25,000'
    const res = SMSDataExtractor.extract(sms, 'income')
    expect(res.isTransaction).toBe(true)
    expect(res.intent).toBe('income')
    expect(res.amount?.value).toBe(5000)
    expect(res.merchant).toBe('EMPLOYER')
  })

  it('captures multi-word merchants after case-insensitive cues', () => {
    const sms = 'Sent Rs.60.00 From HDFC Bank A/C x1234 To PhonePe Merchant On 12/04 Ref 106122334455'
    const res = SMSDataExtractor.extract(sms, 'expense')
    expect(res.amount?.value).toBe(60)
    expect(res.merchant).toBe('PhonePe Merchant')
  })

  it('does not return the bank itself as merchant', () => {
    const sms = 'Rs 500 debited from HDFC Bank account. Avl bal Rs 2,000'
    const res = SMSDataExtractor.extract(sms, 'expense')
    expect(res.amount?.value).toBe(500)
    expect(res.merchant).toBeUndefined()
  })

  it('captures a VPA named after a cue', () => {
    const sms = 'Paid Rs.180.00 to swiggy8@ybl via UPI. Ref no 456712349876.'
    const res = SMSDataExtractor.extract(sms, 'expense')
    expect(res.amount?.value).toBe(180)
    expect(res.merchant).toBe('swiggy8@ybl')
  })

  it('falls back to a VPA anywhere in the body when no cue captures a name', () => {
    const sms = 'Rs.299 debited from A/c XX4321 for UPI to VPA netflix.upi@icici on 10-07-26. Avl Bal Rs.8,000'
    const res = SMSDataExtractor.extract(sms, 'expense')
    expect(res.amount?.value).toBe(299)
    expect(res.merchant).toBe('netflix.upi@icici')
  })

  it('does not treat bank support e-mails as VPAs', () => {
    const sms = 'Rs 120 debited. Avl bal Rs 900. Queries? Write to care@hdfcbank.com'
    const res = SMSDataExtractor.extract(sms, 'expense')
    expect(res.merchant).toBeUndefined()
  })

  it('prefers verb-proximal amount over balance amount', () => {
    const sms = 'Avl bal Rs 9,999. Purchase of Rs 123 at STORE'
    const res = SMSDataExtractor.extract(sms, 'expense')
    expect(res.amount?.value).toBe(123)
  })

  it('captures UTR/RRN references (>=12 chars) and dedupes amounts', () => {
    const sms = 'IMPS UTR ABCD1234EFGH5678 credited Rs 1,000. Also note Rs 1,000 as fee'
    const res = SMSDataExtractor.extract(sms, 'income')
    expect(res.raw.refs.some((r) => r.length >= 12)).toBe(true)
    // dedup amounts should not contain two identical 1000 entries
    const amountValues = res.raw.amounts.map((a) => a.value)
    const thousandCount = amountValues.filter((v) => v === 1000).length
    expect(thousandCount).toBe(1)
  })

  it('detects bank names from known list (case-insensitive)', () => {
    const sms = 'SBI ALERT: Debited Rs 200 at MERCH on 10/10. Avl bal 5000.'
    const res = SMSDataExtractor.extract(sms, 'expense')
    expect(res.bank?.name).toBe('SBI')
  })

  it('handles different amount formats (symbol, rs, plain number after verb)', () => {
    const cases = [
      ['Paid ₹750 to ABC', 750],
      ['debited by 60.0 at XYZ', 60],
      ['received 1,234 from John', 1234],
      ['1,234 INR sent to Mark', 1234],
    ] as const

    for (const [text, expected] of cases) {
      const res = SMSDataExtractor.extract(text, 'expense')
      expect(res.amount?.value).toBe(expected)
    }
  })

  it('reduces confidence when verbs contradict intent', () => {
    const res1 = SMSDataExtractor.extract('credited Rs 100', 'expense')
    const res2 = SMSDataExtractor.extract('debited Rs 100', 'income')
    expect(res1.confidence).toBeLessThan(0.9)
    expect(res2.confidence).toBeLessThan(0.9)
  })
})
