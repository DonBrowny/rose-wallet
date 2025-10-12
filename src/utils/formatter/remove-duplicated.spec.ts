import type { Transaction } from '@/types/sms/transaction'
import { removeDuplicates } from './remove-duplicated'

function makeTxn(overrides: Partial<Transaction>): Transaction {
  return {
    id: overrides.id ?? 't1',
    amount: overrides.amount ?? 0,
    merchant: overrides.merchant ?? 'MERCHANT',
    bankName: overrides.bankName ?? 'BANK',
    transactionDate: overrides.transactionDate ?? 0,
    message: overrides.message ?? {
      id: 'm1',
      body: 'BODY',
      address: 'ADDR',
      date: 0,
      read: true,
    },
  }
}

describe('removeDuplicates', () => {
  it('returns empty array for empty input', () => {
    expect(removeDuplicates([])).toEqual([])
  })

  it('keeps all when message bodies are unique', () => {
    const a = makeTxn({ id: '1', message: { id: 'm1', body: 'A', address: 'x', date: 0, read: true } })
    const b = makeTxn({ id: '2', message: { id: 'm2', body: 'B', address: 'y', date: 0, read: true } })
    const c = makeTxn({ id: '3', message: { id: 'm3', body: 'C', address: 'z', date: 0, read: true } })

    const out = removeDuplicates([a, b, c])
    expect(out).toEqual([a, b, c])
  })

  it('removes subsequent duplicates by identical message.body regardless of other fields', () => {
    const body = 'Paid ₹100 at STORE'
    const first = makeTxn({
      id: '1',
      amount: 100,
      merchant: 'STORE',
      message: { id: 'm1', body, address: 's', date: 0, read: true },
    })
    const dupDifferentAmount = makeTxn({
      id: '2',
      amount: 200,
      merchant: 'STORE',
      message: { id: 'm2', body, address: 's', date: 0, read: true },
    })
    const dupDifferentMerchant = makeTxn({
      id: '3',
      amount: 100,
      merchant: 'OTHER',
      message: { id: 'm3', body, address: 's', date: 0, read: true },
    })

    const out = removeDuplicates([first, dupDifferentAmount, dupDifferentMerchant])
    expect(out).toEqual([first])
  })

  it('preserves the order and keeps the first occurrence only', () => {
    const a1 = makeTxn({ id: '1', message: { id: 'm1', body: 'A', address: 'x', date: 0, read: true } })
    const b1 = makeTxn({ id: '2', message: { id: 'm2', body: 'B', address: 'y', date: 0, read: true } })
    const a2 = makeTxn({ id: '3', message: { id: 'm3', body: 'A', address: 'z', date: 0, read: true } })

    const out = removeDuplicates([a1, b1, a2])
    expect(out).toEqual([a1, b1])
  })

  it('handles empty message bodies as a valid key', () => {
    const x = makeTxn({ id: '1', message: { id: 'm1', body: '', address: 'a', date: 0, read: true } })
    const y = makeTxn({ id: '2', message: { id: 'm2', body: '', address: 'b', date: 0, read: true } })

    const out = removeDuplicates([x, y])
    expect(out).toEqual([x])
  })
})
