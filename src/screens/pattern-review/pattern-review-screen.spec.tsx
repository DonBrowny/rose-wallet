import { reviewReset, useAppStore } from '@/hooks/use-store'
import { fireEvent, render } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import React from 'react'
import { PatternReviewScreen } from './pattern-review-screen'

jest.mock('expo-router', () => ({ useRouter: jest.fn() }))

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}))

jest.mock('react-native-mmkv', () => ({
  useMMKVBoolean: jest.fn(() => [false, jest.fn()]),
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    getBoolean: jest.fn(),
    clearAll: jest.fn(),
  })),
}))

const mockPatternReview = useAppStore.use.patternReview as unknown as jest.Mock
jest.mock('@/hooks/use-store', () => {
  const mockPatternReview = jest.fn()
  const mockReviewReset = jest.fn()
  return {
    useAppStore: { use: { patternReview: mockPatternReview } },
    reviewReset: mockReviewReset,
  }
})

describe('PatternReviewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders empty state when no samples', () => {
    mockPatternReview.mockReturnValue({
      transactions: [],
      name: '',
      currentIndex: 0,
    })

    const { getByText } = render(<PatternReviewScreen />)
    expect(getByText('No samples found for this pattern.')).toBeTruthy()
  })

  it('renders header and closes via button (resets and navigates back)', () => {
    mockPatternReview.mockReturnValue({
      transactions: [
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
      ],
      name: 'PAT',
      currentIndex: 0,
    })

    const backMock = jest.fn()
    ;(useRouter as unknown as jest.Mock).mockReturnValue({ back: backMock })

    const { getByText, getByTestId } = render(<PatternReviewScreen />)
    expect(getByText('Pattern review')).toBeTruthy()
    expect(getByText('Review sample SMS for this pattern.')).toBeTruthy()

    const closeBtn = getByTestId('close-btn')
    fireEvent.press(closeBtn)

    expect(reviewReset as unknown as jest.Mock).toHaveBeenCalled()
    expect(backMock).toHaveBeenCalled()
  })
})
