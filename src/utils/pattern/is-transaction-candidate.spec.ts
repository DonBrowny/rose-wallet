import { isTransactionCandidate } from './is-transaction-candidate'

describe('isTransactionCandidate', () => {
  it('detects completed debits', () => {
    expect(isTransactionCandidate('Rs.250 debited from a/c **1234 to VPA swiggy@icici')).toBe('debit')
    expect(isTransactionCandidate('You spent Rs.1,500.00 on your HDFC card at AMAZON')).toBe('debit')
    expect(isTransactionCandidate('ATM withdrawal of Rs.2,000 from card **9876 at HDFC ATM MG ROAD')).toBe('debit')
  })

  it('detects completed credits', () => {
    expect(isTransactionCandidate('INR 5,000 credited to your a/c **1234 salary for Jul')).toBe('credit')
    expect(isTransactionCandidate('Refund of Rs.399 received in your account')).toBe('credit')
  })

  it('rejects OTP messages', () => {
    expect(isTransactionCandidate('123456 is your OTP for transaction. Do not share it with anyone.')).toBeNull()
  })

  it('rejects promos even with an amount', () => {
    expect(isTransactionCandidate('Flat 50% off! Order now for just Rs.99. T&C apply.')).toBeNull()
  })

  it('rejects balance alerts', () => {
    expect(isTransactionCandidate('Avl Bal in a/c **1234 is Rs.5,000.00 as on 15-08-25')).toBeNull()
  })

  it('rejects failed transactions', () => {
    expect(isTransactionCandidate('Your payment of Rs.250 failed. Amount will be reversed in 3 days.')).toBeNull()
  })

  it('rejects future and scheduled payments', () => {
    expect(isTransactionCandidate('Rs.999 will be debited from your a/c on 01-09-25 towards autopay')).toBeNull()
    expect(isTransactionCandidate('Your credit card bill of Rs.12,000 is due on 05-09-25')).toBeNull()
  })

  it('rejects transaction verbs without an amount', () => {
    expect(isTransactionCandidate('Your complaint has been received and will be processed')).toBeNull()
  })

  it('rejects empty input', () => {
    expect(isTransactionCandidate('')).toBeNull()
  })
})
