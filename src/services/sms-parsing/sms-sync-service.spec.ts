import type { Pattern } from '@/db/schema'
import { getPatterns } from '@/services/database/patterns-repository'
import {
  enqueueUnmatchedSms,
  getUnmatchedSms,
  updateSmsMatchStatusByIds,
} from '@/services/database/sms-messages-repository'
import { normalizeSMSTemplate } from '@/utils/pattern/normalize-sms-template'
import type { SMSMessage } from 'rose-sms-reader'
import { SMSService } from './sms-service'
import { SmsSyncService } from './sms-sync-service'

jest.mock('@/services/database/patterns-repository', () => ({
  getPatterns: jest.fn(),
}))

jest.mock('@/services/database/sms-messages-repository', () => ({
  enqueueUnmatchedSms: jest.fn(),
  getUnmatchedSms: jest.fn(),
  updateSmsMatchStatusByIds: jest.fn(),
}))

jest.mock('./sms-service', () => ({
  SMSService: { getTransactionalSMS: jest.fn() },
}))

const mockGetPatterns = getPatterns as jest.Mock
const mockGetTransactionalSMS = SMSService.getTransactionalSMS as jest.Mock
const mockEnqueue = enqueueUnmatchedSms as jest.Mock
const mockGetUnmatched = getUnmatchedSms as jest.Mock
const mockUpdateStatus = updateSmsMatchStatusByIds as jest.Mock

const DEBIT_SMS =
  'Rs.250 debited from a/c **1234 on 15-08-25 to VPA swiggy@icici UPI Ref 987654321098. Avl Bal Rs.3,750.25'
const DEBIT_VARIANT =
  'Rs.1,500.00 debited from a/c **1234 on 16-08-25 to VPA zomato@hdfc UPI Ref 123456789012. Avl Bal Rs.2,250.25'
const DEBIT_TEMPLATE =
  'Rs.<AMT> debited from a/c **1234 on 15-08-25 to VPA <MERCHANT> UPI Ref 987654321098. Avl Bal Rs.3,750.25'
const PROMO_SMS = 'Flat 50% off! Order now for just Rs.99. T&C apply.'
const OTP_SMS = '123456 is your OTP for login. Do not share it with anyone.'
const ATM_SMS = 'ATM withdrawal of Rs.2,000 from card **9876 on 18-08-25 at HDFC ATM MG ROAD'

let nextId = 1
function makeSms(body: string): SMSMessage {
  return { id: String(nextId++), body, address: 'AD-HDFCBK-T', date: nextId, read: true, type: 1 }
}

function makePattern(overrides: Partial<Pattern>): Pattern {
  return {
    id: 1,
    name: 'test-pattern',
    groupingPattern: '',
    extractionPattern: '',
    extractionRegex: null,
    sender: null,
    normalizerVersion: 1,
    type: 'debit',
    status: 'approved',
    isActive: true,
    usageCount: 0,
    lastUsedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function mockRead(bodies: string[]) {
  mockGetTransactionalSMS.mockResolvedValue({
    success: true,
    sms: bodies.map(makeSms),
    totalSMSRead: bodies.length,
    filteredSMSCount: bodies.length,
    errors: [],
  })
}

describe('SmsSyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetPatterns.mockResolvedValue({ active: [], rejected: [] })
    mockGetUnmatched.mockResolvedValue([])
  })

  it('extracts from SMS matching an approved pattern', async () => {
    const pattern = makePattern({
      id: 7,
      name: 'hdfc-upi-debit',
      groupingPattern: normalizeSMSTemplate(DEBIT_SMS),
      extractionPattern: DEBIT_TEMPLATE,
    })
    mockGetPatterns.mockResolvedValue({ active: [pattern], rejected: [] })
    mockRead([DEBIT_SMS, DEBIT_VARIANT])

    const result = await SmsSyncService.sync({ startTimestamp: 0, endTimestamp: 100 })

    expect(result.extracted).toHaveLength(2)
    expect(result.extracted[0]).toMatchObject({ patternId: 7, amount: 250, merchantRaw: 'swiggy@icici' })
    expect(result.extracted[1]).toMatchObject({ patternId: 7, amount: 1500, merchantRaw: 'zomato@hdfc' })
    expect(result.candidates).toHaveLength(0)
  })

  it('extracts from the template even when a stale compiled regex is stored', async () => {
    const pattern = makePattern({
      groupingPattern: normalizeSMSTemplate(DEBIT_SMS),
      extractionPattern: DEBIT_TEMPLATE,
      extractionRegex: '^a stale compiled regex that matches nothing$',
    })
    mockGetPatterns.mockResolvedValue({ active: [pattern], rejected: [] })
    mockRead([DEBIT_SMS])

    const result = await SmsSyncService.sync({ startTimestamp: 0, endTimestamp: 100 })
    expect(result.extracted[0]).toMatchObject({ amount: 250, merchantRaw: 'swiggy@icici' })
  })

  it('ignores SMS matching a rejected pattern', async () => {
    const rejected = makePattern({ status: 'rejected', groupingPattern: normalizeSMSTemplate(DEBIT_SMS) })
    mockGetPatterns.mockResolvedValue({ active: [], rejected: [rejected] })
    mockRead([DEBIT_SMS])

    const result = await SmsSyncService.sync({ startTimestamp: 0, endTimestamp: 100 })
    expect(result.extracted).toHaveLength(0)
    expect(result.candidates).toHaveLength(0)
    expect(result.ignored).toBe(1)
  })

  it('routes unmatched transaction-like SMS to candidates and drops noise', async () => {
    mockRead([DEBIT_SMS, PROMO_SMS, OTP_SMS])

    const result = await SmsSyncService.sync({ startTimestamp: 0, endTimestamp: 100 })

    expect(result.candidates).toHaveLength(1)
    expect(result.candidates[0].type).toBe('debit')
    expect(result.candidates[0].normalized).toBe(normalizeSMSTemplate(DEBIT_SMS))
    expect(result.ignored).toBe(2)
    expect(result.totalRead).toBe(3)
  })

  it('falls back to the candidate queue when a matched pattern fails to extract (drift)', async () => {
    const drifted = makePattern({
      groupingPattern: normalizeSMSTemplate(DEBIT_SMS),
      extractionPattern: 'A completely different structure <AMT> that will not match',
    })
    mockGetPatterns.mockResolvedValue({ active: [drifted], rejected: [] })
    mockRead([DEBIT_SMS])

    const result = await SmsSyncService.sync({ startTimestamp: 0, endTimestamp: 100 })
    expect(result.extracted).toHaveLength(0)
    expect(result.candidates).toHaveLength(1)
  })

  it('throws when SMS reading fails', async () => {
    mockGetTransactionalSMS.mockResolvedValue({
      success: false,
      sms: [],
      totalSMSRead: 0,
      filteredSMSCount: 0,
      errors: ['Permission denied'],
    })

    await expect(SmsSyncService.sync({ startTimestamp: 0, endTimestamp: 100 })).rejects.toThrow('Permission denied')
  })

  describe('syncWithQueue', () => {
    it('persists transaction-relevant fresh SMS and answers from the queue', async () => {
      mockRead([DEBIT_SMS, OTP_SMS])
      mockGetUnmatched.mockResolvedValue([
        { id: 11, sender: 'AD-HDFCBK-T', body: DEBIT_SMS, date: 5 },
        { id: 12, sender: 'BZ-SBIINB-T', body: DEBIT_VARIANT, date: 6 },
      ])

      const result = await SmsSyncService.syncWithQueue({ startTimestamp: 0, endTimestamp: 100 })

      // The fresh debit was enqueued; the OTP was not.
      expect(mockEnqueue).toHaveBeenCalledTimes(1)
      expect(mockEnqueue.mock.calls[0][0]).toEqual([expect.objectContaining({ body: DEBIT_SMS })])

      // Results come from the queue rows (durable ids), not the fresh scan.
      expect(result.candidates.map((c) => c.sms.id)).toEqual(['11', '12'])
      expect(result.totalRead).toBe(2)
      expect(mockUpdateStatus).toHaveBeenCalledWith([], 'ignored')
    })

    it('resurfaces the backlog once a pattern is approved', async () => {
      const pattern = makePattern({
        id: 9,
        groupingPattern: normalizeSMSTemplate(DEBIT_SMS),
        extractionPattern: DEBIT_TEMPLATE,
      })
      mockGetPatterns.mockResolvedValue({ active: [pattern], rejected: [] })
      mockRead([])
      mockGetUnmatched.mockResolvedValue([
        { id: 21, sender: 'AD-HDFCBK-T', body: DEBIT_SMS, date: 5 },
        { id: 22, sender: 'AD-HDFCBK-T', body: DEBIT_VARIANT, date: 6 },
      ])

      const result = await SmsSyncService.syncWithQueue({ startTimestamp: 0, endTimestamp: 100 })

      expect(result.extracted.map((e) => ({ id: e.sms.id, amount: e.amount }))).toEqual([
        { id: '21', amount: 250 },
        { id: '22', amount: 1500 },
      ])
    })

    it('flushes queue rows whose pattern was rejected', async () => {
      const rejected = makePattern({ status: 'rejected', groupingPattern: normalizeSMSTemplate(DEBIT_SMS) })
      mockGetPatterns.mockResolvedValue({ active: [], rejected: [rejected] })
      mockRead([])
      mockGetUnmatched.mockResolvedValue([
        { id: 31, sender: 'AD-HDFCBK-T', body: DEBIT_SMS, date: 5 },
        { id: 32, sender: 'BZ-SBIINB-T', body: ATM_SMS, date: 6 },
      ])

      const result = await SmsSyncService.syncWithQueue({ startTimestamp: 0, endTimestamp: 100 })

      expect(mockUpdateStatus).toHaveBeenCalledWith([31], 'ignored')
      expect(result.candidates.map((c) => c.sms.id)).toEqual(['32'])
    })
  })
})
