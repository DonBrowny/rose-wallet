import { updateSmsMatchStatusByIds } from '@/services/database/sms-messages-repository'
import type { ReviewTxn } from '@/types/sms-parsing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react-native'
import React from 'react'
import { useRejectExpense } from './use-reject-expense'
import { SMS_TRANSACTIONS_QUERY_KEY } from './use-sms-transactions'

jest.mock('@/services/database/sms-messages-repository', () => ({
  updateSmsMatchStatusByIds: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('rose-sms-reader', () => ({
  checkSMSPermission: jest.fn(),
  requestSMSPermission: jest.fn(),
  isAvailable: jest.fn(),
  readSMS: jest.fn(),
}))

const mockUpdateSmsMatchStatusByIds = updateSmsMatchStatusByIds as jest.Mock

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

describe('useRejectExpense', () => {
  it('marks the SMS ignored and removes it from the cached SMS list without refetching', async () => {
    // Infinite gcTime so no garbage-collection timer keeps jest from exiting.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { gcTime: Infinity } },
    })
    const transactions = [makeTransaction(1), makeTransaction(2), makeTransaction(3)]
    queryClient.setQueryData([SMS_TRANSACTIONS_QUERY_KEY], transactions)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useRejectExpense(), { wrapper })

    result.current.mutate(transactions[1])

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockUpdateSmsMatchStatusByIds).toHaveBeenCalledWith([2], 'ignored')
    const cached = queryClient.getQueryData<ReviewTxn[]>([SMS_TRANSACTIONS_QUERY_KEY])
    expect(cached?.map((t) => t.smsId)).toEqual([1, 3])
    // Surgical cache update, not an invalidation — the query must stay fresh
    // so the review screen never refetches (and re-syncs SMS) mid-session.
    expect(queryClient.getQueryState([SMS_TRANSACTIONS_QUERY_KEY])?.isInvalidated).toBe(false)
  })

  it('never lets a rejected SMS resurface — it stays excluded regardless of DB status filtering', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { gcTime: Infinity } },
    })
    const transactions = [makeTransaction(1)]
    queryClient.setQueryData([SMS_TRANSACTIONS_QUERY_KEY], transactions)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useRejectExpense(), { wrapper })

    result.current.mutate(transactions[0])

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // 'ignored', not 'unmatched' — the residual queue only re-triages unmatched
    // rows, so this is what keeps a rejected SMS from reappearing on next sync.
    expect(mockUpdateSmsMatchStatusByIds).toHaveBeenCalledWith([1], 'ignored')
  })
})
