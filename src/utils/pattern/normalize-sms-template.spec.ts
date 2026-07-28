import { normalizeSMSTemplate } from './normalize-sms-template'

describe('normalizeSMSTemplate', () => {
  it('produces the same grouping template regardless of amount magnitude', () => {
    const small = normalizeSMSTemplate('Rs.500 spent at STORE on 12-10-25. Avl bal Rs.900.00')
    const large = normalizeSMSTemplate('Rs.10000.00 spent at STORE on 12-10-25. Avl bal Rs.38984.96')
    expect(large).toBe(small)
  })

  it('treats comma-grouped and plain amounts identically', () => {
    expect(normalizeSMSTemplate('Rs 1500.00 debited')).toBe(normalizeSMSTemplate('Rs 1,500.00 debited'))
  })

  it('keeps whole plain digit runs in one <CUR><AMT> tag', () => {
    expect(normalizeSMSTemplate('Rs.10000.00 debited')).toBe('<CUR><AMT> debited')
  })

  it('tags dates and bare numbers separately from amounts', () => {
    expect(normalizeSMSTemplate('Paid Rs.100 on 15-08-25 ref 45678')).toBe('Paid <CUR><AMT> on <DATE> ref <NUM>')
  })

  it('tags a currency-less balance after the balance cue', () => {
    expect(normalizeSMSTemplate('debited Rs.50. Avl bal 20,000.')).toContain('<BAL_CUE> <BAL>')
  })

  it('tags VPAs, masked accounts and numeric references', () => {
    const normalized = normalizeSMSTemplate('Rs.250 debited from a/c **1234 to VPA swiggy@icici UPI Ref 987654321098')
    expect(normalized).toBe('<CUR><AMT> debited from a/c <LAST4> to VPA <VPA> UPI Ref <REF>')
  })
})
