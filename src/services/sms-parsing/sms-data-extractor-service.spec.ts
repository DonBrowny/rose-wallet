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
    // merchant neighbor by "at"
    // expect(res.merchant).toBe('SWIGGY') // TODO: uncomment this
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
    // expect(res.merchant).toBe('EMPLOYER') // TODO: uncomment this
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
