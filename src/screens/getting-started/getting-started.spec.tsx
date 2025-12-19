import { fireEvent, render } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import React from 'react'
import { GettingStartedScreen } from './getting-started'

jest.mock('expo-router', () => ({ useRouter: jest.fn() }))

const mockGetPatterns = jest.fn()
const mockGetTransactionCount = jest.fn()

jest.mock('@/hooks/use-get-patterns', () => ({
  useGetPatterns: () => mockGetPatterns(),
}))

jest.mock('@/hooks/use-get-transaction-count', () => ({
  useGetTransactionCount: () => mockGetTransactionCount(),
}))

const mockStorage = {
  getString: jest.fn(),
  set: jest.fn(),
}

jest.mock('@/utils/mmkv/storage', () => ({
  storage: {
    getString: (key: string) => mockStorage.getString(key),
    set: (key: string, value: string) => mockStorage.set(key, value),
  },
}))

describe('GettingStartedScreen', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as unknown as jest.Mock).mockReturnValue(mockRouter)
    mockStorage.getString.mockReturnValue(undefined)
    mockGetPatterns.mockReturnValue({ data: [], isLoading: false })
    mockGetTransactionCount.mockReturnValue({ data: 0, isLoading: false })
  })

  it('renders the getting started screen with two tour cards', () => {
    const { getByText } = render(<GettingStartedScreen />)

    expect(getByText('Getting Started')).toBeTruthy()
    expect(getByText('Two short tours to master your finances.')).toBeTruthy()
    expect(getByText('Learn to review a pattern')).toBeTruthy()
    expect(getByText('Learn to add an expense')).toBeTruthy()
  })

  it('shows pattern tour as not started when no patterns are reviewed', () => {
    mockGetPatterns.mockReturnValue({
      data: [{ id: '1', status: 'needs-review' }],
      isLoading: false,
    })

    const { getByText, getAllByText } = render(<GettingStartedScreen />)

    expect(getAllByText('Not started').length).toBeGreaterThanOrEqual(1)
    expect(getByText('Review at least 2 patterns: Currently you have 0/2 reviewed.')).toBeTruthy()
  })

  it('shows pattern tour as completed when enough patterns are reviewed', () => {
    mockGetPatterns.mockReturnValue({
      data: [
        { id: '1', status: 'approved' },
        { id: '2', status: 'approved' },
      ],
      isLoading: false,
    })

    const { getByText, queryByText } = render(<GettingStartedScreen />)

    expect(getByText('Completed')).toBeTruthy()
    expect(queryByText(/Review at least 2 patterns/)).toBeNull()
  })

  it('shows expense tour as locked when pattern tour is not completed', () => {
    mockGetPatterns.mockReturnValue({ data: [], isLoading: false })

    const { getByText } = render(<GettingStartedScreen />)

    expect(getByText('Locked')).toBeTruthy()
    expect(getByText('Finish the pattern review tour to unlock.')).toBeTruthy()
  })

  it('unlocks expense tour when pattern tour is completed', () => {
    mockGetPatterns.mockReturnValue({
      data: [
        { id: '1', status: 'approved' },
        { id: '2', status: 'approved' },
      ],
      isLoading: false,
    })
    mockGetTransactionCount.mockReturnValue({ data: 0, isLoading: false })

    const { queryByText, getByText } = render(<GettingStartedScreen />)

    expect(queryByText('Locked')).toBeNull()
    expect(getByText('Add at least 2 transactions: Currently you have 0/2 added.')).toBeTruthy()
  })

  it('navigates to patterns screen when Start tour button is pressed', () => {
    const { getAllByText } = render(<GettingStartedScreen />)

    const startButtons = getAllByText('Start tour')
    fireEvent.press(startButtons[0])

    expect(mockRouter.push).toHaveBeenCalledWith('/(shared)/patterns')
  })

  it('navigates to add-expense screen when expense tour button is pressed', () => {
    mockGetPatterns.mockReturnValue({
      data: [
        { id: '1', status: 'approved' },
        { id: '2', status: 'approved' },
      ],
      isLoading: false,
    })

    const { getAllByText } = render(<GettingStartedScreen />)

    const startButtons = getAllByText('Start tour')
    fireEvent.press(startButtons[0])

    expect(mockRouter.push).toHaveBeenCalledWith('/(shared)/add-expense')
  })

  it('saves to storage and navigates to tabs when Skip tour is pressed', () => {
    const { getByText } = render(<GettingStartedScreen />)

    fireEvent.press(getByText('Skip tour'))

    expect(mockStorage.set).toHaveBeenCalledWith('app.getting_started_seen', true)
    expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)')
  })

  it('shows congratulations screen when all tasks are completed', () => {
    mockGetPatterns.mockReturnValue({
      data: [
        { id: '1', status: 'approved' },
        { id: '2', status: 'approved' },
      ],
      isLoading: false,
    })
    mockGetTransactionCount.mockReturnValue({ data: 2, isLoading: false })

    const { getByText } = render(<GettingStartedScreen />)

    expect(getByText('All done!')).toBeTruthy()
    expect(getByText('You are ready to start tracking your finances.')).toBeTruthy()
  })

  it('does not show progress text while loading patterns', () => {
    mockGetPatterns.mockReturnValue({ data: [], isLoading: true })

    const { queryByText } = render(<GettingStartedScreen />)

    expect(queryByText(/Review at least 2 patterns/)).toBeNull()
  })

  it('does not show progress text while loading transactions', () => {
    mockGetPatterns.mockReturnValue({
      data: [
        { id: '1', status: 'approved' },
        { id: '2', status: 'approved' },
      ],
      isLoading: false,
    })
    mockGetTransactionCount.mockReturnValue({ data: 0, isLoading: true })

    const { queryByText } = render(<GettingStartedScreen />)

    expect(queryByText(/Add at least 2 transactions/)).toBeNull()
  })

  it('shows View again button when pattern tour is completed', () => {
    mockGetPatterns.mockReturnValue({
      data: [
        { id: '1', status: 'approved' },
        { id: '2', status: 'approved' },
      ],
      isLoading: false,
    })

    const { getByText } = render(<GettingStartedScreen />)

    expect(getByText('View again')).toBeTruthy()
  })
})
