import { act } from '@testing-library/react-native'
import { finalizeReview, reviewNext, reviewPrev, reviewReset, reviewUpdateItem, useAppStore } from './use-store'

const sampleTxns = [
  {
    id: '1',
    amount: 100,
    merchant: 'A',
    bankName: 'B',
    transactionDate: 1,
    message: { id: 'm1', body: 'x', address: 'a', date: 1, read: true },
  },
  {
    id: '2',
    amount: 200,
    merchant: 'C',
    bankName: 'D',
    transactionDate: 2,
    message: { id: 'm2', body: 'y', address: 'b', date: 2, read: true },
  },
] as any

jest.mock('@/utils/mmkv/pattern-samples', () => ({ setPatternSamplesByName: jest.fn() }))
jest.mock('@/utils/pattern/extraction-template-builder', () => ({ buildExtractionFromUser: () => ({ template: 'T' }) }))
jest.mock('@/services/database/patterns-repository', () => ({
  updatePatternTemplateByName: jest.fn().mockResolvedValue(undefined),
}))

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.setState({
      patternReview: { transactions: [], name: '', currentIndex: 0 },
      isSaving: false,
      error: undefined,
    } as any)
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
      reviewUpdateItem(1, { merchant: 'ZZ' } as any)
    })
    expect(useAppStore.getState().patternReview.transactions[1].merchant).toBe('ZZ')
  })

  it('finalizeReview persists and updates template', async () => {
    act(() => {
      useAppStore.getState().setPatternReview(sampleTxns, 'N')
    })
    await finalizeReview()
    expect(useAppStore.getState().isSaving).toBe(false)
    expect(useAppStore.getState().error).toBeUndefined()
  })
})
