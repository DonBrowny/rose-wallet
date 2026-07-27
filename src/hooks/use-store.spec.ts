import { act } from '@testing-library/react-native'
import { finalizeReview, reviewNext, reviewPrev, reviewReset, reviewUpdateItem, useAppStore } from './use-store'

const sampleTxns = [
  { smsId: 1, amount: 100, type: 'debit', merchantRaw: 'A', bank: 'B', date: 1, sender: 'a', body: 'x' },
  { smsId: 2, amount: 200, type: 'debit', merchantRaw: 'C', bank: 'D', date: 2, sender: 'b', body: 'y' },
] as any

jest.mock('@/services/sms-parsing/pattern-approval-service', () => ({
  PatternApprovalService: { approve: jest.fn().mockResolvedValue({ warnings: [], accuracy: 1 }) },
}))

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useAppStore.setState({
        patternReview: { transactions: [], name: '', currentIndex: 0 },
        isSaving: false,
        error: undefined,
      } as any)
    })
  })

  it('initializes and updates pattern review state', () => {
    act(() => {
      useAppStore.getState().setPatternReview(sampleTxns, 'NAME')
    })
    const s = useAppStore.getState()
    expect(s.patternReview.transactions.length).toBe(2)
    expect(s.patternReview.name).toBe('NAME')
    expect(s.patternReview.currentIndex).toBe(0)
  })

  it('navigates next/prev/reset through review items', () => {
    act(() => {
      useAppStore.getState().setPatternReview(sampleTxns, 'N')
      reviewNext()
      reviewNext()
      reviewPrev()
      reviewReset()
    })
    expect(useAppStore.getState().patternReview.currentIndex).toBe(0)
  })

  it('updates a specific transaction via patch', () => {
    act(() => {
      useAppStore.getState().setPatternReview(sampleTxns, 'N')
      reviewUpdateItem(1, { merchantRaw: 'ZZ' })
    })
    expect(useAppStore.getState().patternReview.transactions[1].merchantRaw).toBe('ZZ')
  })

  it('finalizeReview persists and updates template', async () => {
    act(() => {
      useAppStore.getState().setPatternReview(sampleTxns, 'N')
    })
    await act(async () => {
      await finalizeReview()
    })
    expect(useAppStore.getState().isSaving).toBe(false)
    expect(useAppStore.getState().error).toBeUndefined()
  })
})
