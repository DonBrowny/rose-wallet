import type { Transaction } from '@/types/sms/transaction'
import {
  buildExtractionFromUser,
  extractAmountAndMerchant,
  generateTemplate,
  replaceText,
  templateRanking,
} from './extraction-template-builder'

function makeTxn(overrides: Partial<Transaction>): Transaction {
  return {
    id: overrides.id ?? 't1',
    amount: overrides.amount ?? 0,
    merchant: overrides.merchant ?? 'MERCHANT',
    bankName: overrides.bankName ?? 'BANK',
    transactionDate: overrides.transactionDate ?? Date.now(),
    message: overrides.message ?? {
      id: 'm1',
      body: 'SMS',
      address: 'TX',
      date: Date.now(),
      read: true,
    },
  }
}

describe('replaceText', () => {
  it('replaces first occurrence of matcher with provided text', () => {
    const out = replaceText('abc123def123', 'X', '123')
    expect(out).toBe('abcXdef123')
  })

  it('returns original string when matcher not found', () => {
    const out = replaceText('abcdef', 'X', 'zzz')
    expect(out).toBe('abcdef')
  })

  it('inserts text at the beginning when matcher is empty string', () => {
    const out = replaceText('abcdef', 'X', '')
    expect(out).toBe('Xabcdef')
  })

  it('removes matcher when replacement text is empty', () => {
    const out = replaceText('abc123def', '', '123')
    expect(out).toBe('abcdef')
  })

  it('replaces only the first of multiple occurrences', () => {
    const out = replaceText('xx-xx-xx', 'Y', 'xx')
    expect(out).toBe('Y-xx-xx')
  })
})

describe('generateTemplate', () => {
  it('replaces amount and merchant with placeholders', () => {
    const txn = makeTxn({
      amount: 120,
      merchant: 'AMAZON',
      message: {
        id: '1',
        body: 'Paid ₹120 at AMAZON on 2025-10-01',
        address: 'AMZ',
        date: 0,
        read: true,
      },
    })
    const template = generateTemplate(txn)
    expect(template).toBe('Paid ₹<AMT> at <MERCHANT> on 2025-10-01')
  })

  it('replaces only merchant when amount string not present', () => {
    const txn = makeTxn({
      amount: 120,
      merchant: 'AMAZON',
      message: {
        id: '1',
        body: 'Paid at AMAZON on 2025-10-01',
        address: 'AMZ',
        date: 0,
        read: true,
      },
    })
    const template = generateTemplate(txn)
    expect(template).toBe('Paid at <MERCHANT> on 2025-10-01')
  })

  it('replaces only amount when merchant string not present', () => {
    const txn = makeTxn({
      amount: 120,
      merchant: 'AMAZON',
      message: {
        id: '1',
        body: 'Paid ₹120 at UNKNOWN',
        address: 'AMZ',
        date: 0,
        read: true,
      },
    })
    const template = generateTemplate(txn)
    expect(template).toBe('Paid ₹<AMT> at UNKNOWN')
  })

  it('replaces only the first occurrence of amount and merchant', () => {
    const txn = makeTxn({
      amount: 120,
      merchant: 'AMAZON',
      message: {
        id: '1',
        body: 'Paid ₹120 and 120 later at AMAZON AMAZON',
        address: 'AMZ',
        date: 0,
        read: true,
      },
    })
    const template = generateTemplate(txn)
    expect(template).toBe('Paid ₹<AMT> and 120 later at <MERCHANT> AMAZON')
  })
})

describe('extractAmountAndMerchant', () => {
  it('extracts values using placeholders diff', () => {
    const template = 'Paid ₹<AMT> at <MERCHANT> on 2025-10-01'
    const sms = 'Paid ₹450 at SWIGGY on 2025-10-01'
    const result = extractAmountAndMerchant(template, sms)
    expect(result).toEqual({ amount: '450', merchant: 'SWIGGY' })
  })

  it('extracts correctly with surrounding prefix/suffix text', () => {
    const template = 'Ref:X Paid ₹<AMT> at <MERCHANT>!'
    const sms = 'Ref:X Paid ₹789 at SHOP!'
    const result = extractAmountAndMerchant(template, sms)
    expect(result).toEqual({ amount: '789', merchant: 'SHOP' })
  })

  it('works when placeholders are at string edges', () => {
    const template = '<AMT> at <MERCHANT>'
    const sms = '999 at EDGE'
    const result = extractAmountAndMerchant(template, sms)
    expect(result).toEqual({ amount: '999', merchant: 'EDGE' })
  })
})

describe('templateRanking', () => {
  it('computes fraction of correctly extracted samples', () => {
    const template = 'Paid ₹<AMT> at <MERCHANT>.'
    const samples: Transaction[] = [
      makeTxn({
        amount: 100,
        merchant: 'TEST_A',
        message: { id: '1', body: 'Paid ₹100 at TEST_A.', address: 's', date: 0, read: true },
      }),
      makeTxn({
        amount: 200,
        merchant: 'TEST_B',
        message: { id: '2', body: 'Paid ₹200 at TEST_B.', address: 's', date: 0, read: true },
      }),
      makeTxn({
        amount: 300,
        merchant: 'TEST_C',
        message: { id: '3', body: 'Debited ₹300 to C.', address: 's', date: 0, read: true },
      }),
    ]
    const score = templateRanking(template, samples)
    expect(score).toBeCloseTo(2 / 3, 2)
  })
})

describe('buildExtractionFromUser', () => {
  it('returns single template when all samples resolve to the same template', () => {
    const samples: Transaction[] = [
      makeTxn({
        amount: 111,
        merchant: 'X',
        message: { id: '1', body: 'Paid ₹111 at X.', address: 's', date: 0, read: true },
      }),
      makeTxn({
        amount: 222,
        merchant: 'Y',
        message: { id: '2', body: 'Paid ₹222 at Y.', address: 's', date: 0, read: true },
      }),
      makeTxn({
        amount: 333,
        merchant: 'Z',
        message: { id: '3', body: 'Paid ₹333 at Z.', address: 's', date: 0, read: true },
      }),
    ]
    const { template, regex } = buildExtractionFromUser(samples)
    expect(template).toBe('Paid ₹<AMT> at <MERCHANT>.')
    expect(regex).toBe('')
  })

  it('chooses the best-ranked template when multiple templates are present', () => {
    const paid1 = makeTxn({
      amount: 100,
      merchant: 'A',
      message: { id: '1', body: 'Paid ₹100 at A.', address: 's', date: 0, read: true },
    })
    const paid2 = makeTxn({
      amount: 200,
      merchant: 'B',
      message: { id: '2', body: 'Paid ₹200 at B.', address: 's', date: 0, read: true },
    })
    const debited = makeTxn({
      amount: 300,
      merchant: 'C',
      message: { id: '3', body: 'Debited ₹300 to C.', address: 's', date: 0, read: true },
    })

    const { template } = buildExtractionFromUser([paid1, paid2, debited])

    // Paid-pattern appears twice; Debited-pattern once, so Paid-template should be preferred
    expect(template).toBe('Paid ₹<AMT> at <MERCHANT>.')
  })
})
