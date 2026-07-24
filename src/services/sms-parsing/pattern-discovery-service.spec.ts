import { upsertPatternsByGrouping } from '@/services/database/patterns-repository'
import { murmurHash32 } from '@/utils/hash/murmur32'
import { setPatternSamplesByName } from '@/utils/mmkv/pattern-samples'
import { normalizeSMSTemplate } from '@/utils/pattern/normalize-sms-template'
import type { SMSMessage } from 'rose-sms-reader'
import { PatternDiscoveryService } from './pattern-discovery-service'
import { SmsSyncService, type CandidateSms } from './sms-sync-service'

jest.mock('@/services/database/patterns-repository', () => ({
  upsertPatternsByGrouping: jest.fn(),
}))

jest.mock('@/utils/mmkv/pattern-samples', () => ({
  setPatternSamplesByName: jest.fn(),
}))

jest.mock('./sms-sync-service', () => ({
  SmsSyncService: { syncWithQueue: jest.fn() },
}))

jest.mock('./sms-reader-service', () => ({
  SMSReaderService: {
    createLastNDaysRange: jest.fn(() => ({ startTimestamp: 0, endTimestamp: 100 })),
  },
}))

const mockSync = SmsSyncService.syncWithQueue as jest.Mock
const mockUpsert = upsertPatternsByGrouping as jest.Mock
const mockSetSamples = setPatternSamplesByName as jest.Mock

let nextId = 1
function makeCandidate(body: string): CandidateSms {
  const sms: SMSMessage = { id: String(nextId++), body, address: 'AD-HDFCBK-T', date: nextId, read: true, type: 1 }
  return { sms, normalized: normalizeSMSTemplate(body), type: 'debit' }
}

const UPI_BODIES = [
  'Rs.250 debited from a/c **1234 on 15-08-25 to VPA swiggy@icici UPI Ref 987654321098. Avl Bal Rs.3,750.25',
  'Rs.1,500.00 debited from a/c **1234 on 16-08-25 to VPA zomato@hdfc UPI Ref 123456789012. Avl Bal Rs.2,250.25',
  'Rs.99 debited from a/c **1234 on 17-08-25 to VPA blinkit@ybl UPI Ref 555666777888. Avl Bal Rs.2,151.25',
]
const ATM_BODY = 'ATM withdrawal of Rs.2,000 from card **9876 on 18-08-25 at HDFC ATM MG ROAD'

describe('PatternDiscoveryService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('groups candidates into pattern drafts with proposed templates and samples', async () => {
    mockSync.mockResolvedValue({
      extracted: [],
      candidates: [...UPI_BODIES.map(makeCandidate), makeCandidate(ATM_BODY)],
      ignored: 0,
      totalRead: 4,
    })

    const result = await PatternDiscoveryService.discoverFromLastNDays(60)

    expect(result.patternsFound).toBe(2)
    const drafts = mockUpsert.mock.calls[0][0]
    expect(drafts).toHaveLength(2)

    const upiDraft = drafts[0]
    expect(upiDraft.occurrences).toBe(3)
    expect(upiDraft.status).toBe('needs-review')
    expect(upiDraft.template).toContain('<AMT>')
    expect(upiDraft.template).toContain('<MERCHANT>')
    expect(upiDraft.transactions.map((t: { amount: number }) => t.amount)).toEqual([250, 1500, 99])

    expect(mockSetSamples).toHaveBeenCalledWith(murmurHash32(upiDraft.groupingTemplate), upiDraft.transactions)
  })

  it('skips candidates where the parser finds no amount', async () => {
    mockSync.mockResolvedValue({
      extracted: [],
      candidates: [makeCandidate('debited alert: something happened with your account rs')],
      ignored: 0,
      totalRead: 1,
    })

    const result = await PatternDiscoveryService.discoverFromLastNDays(60)
    expect(result.patternsFound).toBe(0)
    expect(mockUpsert).toHaveBeenCalledWith([])
  })

  it('caps stored samples per pattern at three', async () => {
    const bodies = [
      ...UPI_BODIES,
      'Rs.42 debited from a/c **1234 on 18-08-25 to VPA extra@upi UPI Ref 444555666777. Avl Bal Rs.2,109.25',
    ]
    mockSync.mockResolvedValue({
      extracted: [],
      candidates: bodies.map(makeCandidate),
      ignored: 0,
      totalRead: bodies.length,
    })

    await PatternDiscoveryService.discoverFromLastNDays(60)
    expect(mockSetSamples.mock.calls[0][1]).toHaveLength(3)
  })
})
