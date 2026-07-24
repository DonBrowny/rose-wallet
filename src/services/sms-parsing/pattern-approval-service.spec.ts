import { incrementPatternUsageByName, updatePatternTemplateByName } from '@/services/database/patterns-repository'
import { getUnmatchedSms } from '@/services/database/sms-messages-repository'
import type { Transaction } from '@/types/sms/transaction'
import { setPatternSamplesByName } from '@/utils/mmkv/pattern-samples'
import { extractWithPattern } from '@/utils/pattern/extract-with-pattern'
import { PatternApprovalService } from './pattern-approval-service'

jest.mock('@/services/database/patterns-repository', () => ({
  updatePatternTemplateByName: jest.fn(),
  incrementPatternUsageByName: jest.fn(),
}))

jest.mock('@/services/database/sms-messages-repository', () => ({
  getUnmatchedSms: jest.fn().mockResolvedValue([]),
}))

jest.mock('@/utils/mmkv/pattern-samples', () => ({
  setPatternSamplesByName: jest.fn(),
}))

const mockUpdate = updatePatternTemplateByName as jest.Mock
const mockIncrementUsage = incrementPatternUsageByName as jest.Mock
const mockGetUnmatched = getUnmatchedSms as jest.Mock
const mockSetSamples = setPatternSamplesByName as jest.Mock

let nextId = 1
function makeSample(body: string, amount: number, merchant: string): Transaction {
  return {
    id: String(nextId++),
    amount,
    merchant,
    bankName: 'HDFC',
    transactionDate: nextId,
    message: { id: String(nextId), body, address: 'AD-HDFCBK-T', date: nextId, read: true, type: 1 },
  }
}

const samples = [
  makeSample(
    'Rs.250 debited from a/c **1234 on 15-08-25 to VPA swiggy@icici UPI Ref 987654321098. Avl Bal Rs.3,750.25',
    250,
    'swiggy@icici'
  ),
  makeSample(
    'Rs.1,500.00 debited from a/c **1234 on 16-08-25 to VPA zomato@hdfc UPI Ref 123456789012. Avl Bal Rs.2,250.25',
    1500,
    'zomato@hdfc'
  ),
]

describe('PatternApprovalService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUnmatched.mockResolvedValue([])
  })

  it('builds, verifies, and saves the template with its compiled regex', async () => {
    const result = await PatternApprovalService.approve('pattern-name', samples)

    expect(result.accuracy).toBe(1)
    expect(result.backlogMatches).toBe(0)
    expect(mockSetSamples).toHaveBeenCalledWith('pattern-name', samples)
    expect(mockUpdate).toHaveBeenCalledTimes(1)

    const [name, template, regexSource] = mockUpdate.mock.calls[0]
    expect(name).toBe('pattern-name')
    expect(template).toContain('<AMT>')
    expect(template).toContain('<MERCHANT>')

    const fresh =
      'Rs.2,345.67 debited from a/c **1234 on 18-08-25 to VPA bigbasket@icici UPI Ref 111222333444. Avl Bal Rs.10,000.00'
    expect(extractWithPattern(regexSource, fresh)).toEqual({ amount: 2345.67, merchantRaw: 'bigbasket@icici' })
  })

  it('sweeps the residual queue and reports how many messages the pattern now reads', async () => {
    mockGetUnmatched.mockResolvedValue([
      {
        id: 1,
        sender: 'AD-HDFCBK-T',
        body: 'Rs.2,345.67 debited from a/c **1234 on 18-08-25 to VPA bigbasket@icici UPI Ref 111222333444. Avl Bal Rs.10,000.00',
        date: 1,
      },
      { id: 2, sender: 'BZ-SBIINB-T', body: 'ATM withdrawal of Rs.500 from card **9876 on 15-08-25', date: 2 },
    ])

    const result = await PatternApprovalService.approve('pattern-name', samples)

    expect(result.backlogMatches).toBe(1)
    expect(mockIncrementUsage).toHaveBeenCalledWith('pattern-name', 1)
  })

  it('rejects an approval whose template cannot reproduce the samples', async () => {
    const bad = [makeSample('Paid Rs.99 to Blinkit', 12345, 'NotInMessage')]

    await expect(PatternApprovalService.approve('pattern-name', bad)).rejects.toThrow(
      'Could not build a template that reproduces the reviewed samples'
    )
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('requires a name and at least one sample', async () => {
    await expect(PatternApprovalService.approve('', samples)).rejects.toThrow('Pattern name is required')
    await expect(PatternApprovalService.approve('pattern-name', [])).rejects.toThrow(
      'At least one reviewed sample is required'
    )
  })
})
