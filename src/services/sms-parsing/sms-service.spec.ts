import type { Transaction } from '@/types/sms/transaction'
import { removeDuplicates } from '@/utils/formatter/remove-duplicated'
import { findDistinctPatterns } from '@/utils/pattern/find-distinct-pattern'
import { SMSDataExtractor } from './sms-data-extractor-service'
import { SMSIntentService } from './sms-intent-service'
import { SMSPermissionService } from './sms-permission-service'
import { SMSReaderService } from './sms-reader-service'
import { SMSService } from './sms-service'

jest.mock('./sms-permission-service', () => ({
  SMSPermissionService: {
    requestPermissionWithExplanation: jest.fn(),
  },
}))

jest.mock('./sms-reader-service', () => ({
  SMSReaderService: {
    readSMS: jest.fn(),
    createLastNDaysRange: jest.fn().mockReturnValue({ startTimestamp: 1, endTimestamp: 2 }),
  },
}))

jest.mock('./sms-intent-service', () => ({
  SMSIntentService: {
    getInstance: jest.fn().mockReturnValue({
      init: jest.fn().mockResolvedValue(undefined),
      classify: jest.fn(),
    }),
  },
}))

jest.mock('./sms-data-extractor-service', () => ({
  SMSDataExtractor: {
    extract: jest.fn(),
  },
}))

jest.mock('@/utils/formatter/remove-duplicated', () => ({
  removeDuplicates: jest.fn((txns: Transaction[]) => txns),
}))

jest.mock('@/utils/pattern/find-distinct-pattern', () => ({
  findDistinctPatterns: jest.fn(() => [{ id: 'p1' }]),
}))

describe('SMSService', () => {
  const permissionSvc = SMSPermissionService as jest.Mocked<typeof SMSPermissionService>
  const readerSvc = SMSReaderService as jest.Mocked<typeof SMSReaderService>
  const intentSvc = SMSIntentService as jest.Mocked<typeof SMSIntentService>
  const dataExtractor = SMSDataExtractor as jest.Mocked<typeof SMSDataExtractor>
  const removeDuplicatesMock = removeDuplicates as jest.MockedFunction<typeof removeDuplicates>
  const findDistinctPatternsMock = findDistinctPatterns as jest.MockedFunction<typeof findDistinctPatterns>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTransactionsFromSMS', () => {
    it('returns failure when permission denied', async () => {
      permissionSvc.requestPermissionWithExplanation.mockResolvedValueOnce({
        granted: false,
        canAskAgain: false,
        message: 'Denied',
      })

      const res = await SMSService.getTransactionsFromSMS({ startTimestamp: 1, endTimestamp: 2 })
      expect(res.success).toBe(false)
      expect(res.transactions).toEqual([])
      expect(res.totalSMSRead).toBe(0)
      expect(res.totalTransactions).toBe(0)
      expect(res.errors).toEqual(['Denied'])
    })

    it('returns failure when readSMS fails', async () => {
      permissionSvc.requestPermissionWithExplanation.mockResolvedValueOnce({
        granted: true,
        canAskAgain: true,
        message: '',
      })
      readerSvc.readSMS.mockResolvedValueOnce({
        success: false,
        messages: [],
        error: 'read error',
        totalCount: 0,
      })

      const res = await SMSService.getTransactionsFromSMS({ startTimestamp: 1, endTimestamp: 2 })
      expect(res.success).toBe(false)
      expect(res.errors).toEqual(['read error'])
      expect(res.totalSMSRead).toBe(0)
      expect(res.totalTransactions).toBe(0)
    })

    it('returns success with extracted transactions and captures per-SMS errors', async () => {
      permissionSvc.requestPermissionWithExplanation.mockResolvedValueOnce({
        granted: true,
        canAskAgain: true,
        message: '',
      })
      readerSvc.readSMS.mockResolvedValueOnce({
        success: true,
        totalCount: 3,
        messages: [
          { id: '1', body: 'no txn', address: 'HDFCBK-T', date: 1, read: true, type: 0 },
          { id: '2', body: 'expense 100', address: 'SBIINB-T', date: 2, read: true, type: 0 },
          { id: '3', body: 'bad parse', address: 'ICICIB-S', date: 3, read: true, type: 0 },
        ],
      })

      const instance = intentSvc.getInstance()
      ;(instance.init as jest.Mock).mockResolvedValue(undefined)
      ;(instance.classify as jest.Mock)
        .mockResolvedValueOnce({ label: 'not_txn' })
        .mockResolvedValueOnce({ label: 'expense' })
        .mockRejectedValueOnce(new Error('cls err'))
      ;(dataExtractor.extract as jest.Mock).mockReturnValueOnce({
        amount: { value: 100 },
        merchant: 'SHOP',
        bank: { name: 'SBI' },
      })

      const res = await SMSService.getTransactionsFromSMS({ startTimestamp: 1, endTimestamp: 2 })
      expect(res.success).toBe(true)
      expect(res.totalSMSRead).toBe(3)
      expect(res.transactions).toEqual([
        {
          id: '2',
          amount: 100,
          merchant: 'SHOP',
          bankName: 'SBI',
          transactionDate: 2,
          message: { id: '2', body: 'expense 100', address: 'SBIINB-T', date: 2, read: true, type: 0 },
        },
      ])
      expect(res.totalTransactions).toBe(1)
      expect(res.errors.length).toBe(1)
      expect(res.errors[0]).toMatch('Error processing SMS 3:')
    })

    it('handles unexpected top-level error', async () => {
      permissionSvc.requestPermissionWithExplanation.mockImplementationOnce(() => {
        throw new Error('boom')
      })
      const res = await SMSService.getTransactionsFromSMS({ startTimestamp: 1, endTimestamp: 2 })
      expect(res.success).toBe(false)
      expect(res.errors[0]).toContain('Unexpected error: boom')
    })
  })

  describe('getTransactionPatterns', () => {
    it('deduplicates, finds distinct patterns, and returns summary', async () => {
      const txns: Transaction[] = [
        {
          id: '1',
          amount: 50,
          merchant: 'A',
          bankName: 'SBI',
          transactionDate: 1,
          message: { id: 'm1', body: 'x', address: 'a', date: 1, read: true },
        },
      ]
      removeDuplicatesMock.mockReturnValueOnce(txns)
      findDistinctPatternsMock.mockReturnValueOnce([
        {
          id: 'p1',
          template: '',
          groupingTemplate: '',
          occurrences: 1,
          transactions: txns,
          patternType: 'debit',
          status: 'approved',
        },
        {
          id: 'p2',
          template: '',
          groupingTemplate: '',
          occurrences: 1,
          transactions: txns,
          patternType: 'debit',
          status: 'approved',
        },
      ])

      const res = await SMSService.getTransactionPatterns({
        success: true,
        transactions: txns,
        totalSMSRead: 5,
        totalTransactions: 1,
        errors: [],
      })

      expect(removeDuplicatesMock).toHaveBeenCalledWith(txns)
      expect(findDistinctPatternsMock).toHaveBeenCalledWith(txns)
      expect(res.success).toBe(true)
      expect(res.transactions).toBe(txns)
      //   expect(res.distinctPatterns).toEqual([{ id: 'p1' }, { id: 'p2' }])
      expect(res.totalPatterns).toBe(2)
      expect(res.totalSMSRead).toBe(5)
      expect(res.totalTransactions).toBe(1)
      expect(res.errors).toEqual([])
    })

    it('handles unexpected error', async () => {
      removeDuplicatesMock.mockImplementationOnce(() => {
        throw new Error('bad')
      })

      const res = await SMSService.getTransactionPatterns({
        success: true,
        transactions: [],
        totalSMSRead: 0,
        totalTransactions: 0,
        errors: [],
      })

      expect(res.success).toBe(false)
      expect(res.errors[0]).toContain('Unexpected error: bad')
    })
  })

  describe('processSMSMessagesLastNDays', () => {
    it('delegates to getTransactionsFromSMS with computed range', async () => {
      const spy = jest.spyOn(SMSService, 'getTransactionsFromSMS').mockResolvedValue({
        success: true,
        transactions: [],
        totalSMSRead: 0,
        totalTransactions: 0,
        errors: [],
      })
      const res = await SMSService.processSMSMessagesLastNDays(7)
      expect(readerSvc.createLastNDaysRange).toHaveBeenCalledWith(7)
      expect(spy).toHaveBeenCalledWith({ startTimestamp: 1, endTimestamp: 2 })
      expect(res.success).toBe(true)
    })
  })

  describe('getDistinctSMSMessagesLastNDays', () => {
    it('processes and aggregates distinct patterns for last N days', async () => {
      jest.spyOn(SMSService, 'processSMSMessagesLastNDays').mockResolvedValue({
        success: true,
        transactions: [
          {
            id: '1',
            amount: 1,
            merchant: 'M',
            bankName: 'B',
            transactionDate: 1,
            message: { id: 'm', body: 'b', address: 'a', date: 1, read: true },
          },
        ],
        totalSMSRead: 10,
        totalTransactions: 1,
        errors: [],
      })
      jest.spyOn(SMSService, 'getTransactionPatterns').mockResolvedValue({
        success: true,
        transactions: [],
        distinctPatterns: [{ id: 'p' }],
        totalSMSRead: 10,
        totalTransactions: 1,
        totalPatterns: 1,
        errors: [],
      } as any)

      const res = await SMSService.getDistinctSMSMessagesLastNDays(30)
      expect(res.success).toBe(true)
      expect(res.distinctPatterns).toEqual([{ id: 'p' }])
    })
  })
})
