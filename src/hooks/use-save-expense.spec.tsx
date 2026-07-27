import { saveExpense } from '@/services/database/save-expense'
import type { ReviewTxn } from '@/types/sms-parsing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react-native'
import React from 'react'
import { useSaveExpense } from './use-save-expense'
import { SMS_TRANSACTIONS_QUERY_KEY } from './use-sms-transactions'

jest.mock('@/services/database/save-expense', () => ({
  saveExpense: jest.fn().mockResolvedValue({ merchantId: 1, categoryId: 1, smsId: 1 }),
}))

jest.mock('rose-sms-reader', () => ({
  checkSMSPermission: jest.fn(),
  requestSMSPermission: jest.fn(),
  isAvailable: jest.fn(),
  readSMS: jest.fn(),
}))

const mockSaveExpense = saveExpense as jest.Mock

function makeTransaction(smsId: number): ReviewTxn {
  return {
    smsId,
    amount: 250,
    type: 'debit',
    merchantRaw: 'Swiggy',
    date: 1000,
    patternId: 7,
    sender: 'AD-HDFCBK-T',
    body: 'Rs.250 debited',
  }
}

describe('useSaveExpense', () => {
  it('removes the saved transaction from the cached SMS list without refetching', async () => {
    // Infinite gcTime so no garbage-collection timer keeps jest from exiting.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { gcTime: Infinity } },
    })
    const transactions = [makeTransaction(1), makeTransaction(2), makeTransaction(3)]
    queryClient.setQueryData([SMS_TRANSACTIONS_QUERY_KEY], transactions)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useSaveExpense(), { wrapper })

    result.current.mutate({
      transaction: transactions[1],
      amount: 250,
      merchantName: 'Swiggy',
      categoryName: 'Food',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockSaveExpense).toHaveBeenCalledTimes(1)
    expect(mockSaveExpense).toHaveBeenCalledWith(expect.objectContaining({ smsId: 2, smsDate: 1000, patternId: 7 }))
    const cached = queryClient.getQueryData<ReviewTxn[]>([SMS_TRANSACTIONS_QUERY_KEY])
    expect(cached?.map((t) => t.smsId)).toEqual([1, 3])
    // Surgical cache update, not an invalidation — the query must stay fresh
    // so the review screen never refetches (and re-syncs SMS) mid-session.
    expect(queryClient.getQueryState([SMS_TRANSACTIONS_QUERY_KEY])?.isInvalidated).toBe(false)
  })
})
