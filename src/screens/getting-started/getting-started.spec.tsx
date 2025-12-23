import { fireEvent, render } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import React from 'react'
import { GettingStartedScreen } from './getting-started'

jest.mock('expo-router', () => ({ useRouter: jest.fn() }))

const mockUseGettingStarted = jest.fn()

jest.mock('@/hooks/use-getting-started', () => ({
  useGettingStarted: () => mockUseGettingStarted(),
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
    mockUseGettingStarted.mockReturnValue({
      allTasksCompleted: false,
      patternStatus: 'pending',
      patternProgress: '0/2 reviewed',
      expenseStatus: 'locked',
      expenseProgress: 'Complete patterns first',
    })
  })

  it('renders the getting started screen with two checklist items', () => {
    const { getByText } = render(<GettingStartedScreen />)

    expect(getByText('Getting Started')).toBeTruthy()
    expect(getByText('Complete these to master your finances.')).toBeTruthy()
    expect(getByText('Review 2 patterns')).toBeTruthy()
    expect(getByText('Add 2 expenses')).toBeTruthy()
  })

  it('shows pattern progress when patterns are not completed', () => {
    const { getByText } = render(<GettingStartedScreen />)

    expect(getByText('0/2 reviewed')).toBeTruthy()
  })

  it('shows Done when pattern tour is completed', () => {
    mockUseGettingStarted.mockReturnValue({
      allTasksCompleted: false,
      patternStatus: 'completed',
      patternProgress: undefined,
      expenseStatus: 'pending',
      expenseProgress: '0/2 added',
    })

    const { getAllByText, queryByText } = render(<GettingStartedScreen />)

    expect(getAllByText('Done').length).toBeGreaterThanOrEqual(1)
    expect(queryByText('0/2 reviewed')).toBeNull()
  })

  it('shows expense tour as locked when pattern tour is not completed', () => {
    const { getByText } = render(<GettingStartedScreen />)

    expect(getByText('Locked')).toBeTruthy()
    expect(getByText('Complete patterns first')).toBeTruthy()
  })

  it('unlocks expense tour when pattern tour is completed', () => {
    mockUseGettingStarted.mockReturnValue({
      allTasksCompleted: false,
      patternStatus: 'completed',
      patternProgress: undefined,
      expenseStatus: 'pending',
      expenseProgress: '0/2 added',
    })

    const { queryByText, getByText } = render(<GettingStartedScreen />)

    expect(queryByText('Locked')).toBeNull()
    expect(getByText('0/2 added')).toBeTruthy()
  })

  it('navigates to patterns screen when Start button is pressed', () => {
    const { getAllByText } = render(<GettingStartedScreen />)

    const startButtons = getAllByText('Start')
    fireEvent.press(startButtons[0])

    expect(mockRouter.push).toHaveBeenCalledWith('/(shared)/patterns')
  })

  it('navigates to add-expense screen when expense Start button is pressed', () => {
    mockUseGettingStarted.mockReturnValue({
      allTasksCompleted: false,
      patternStatus: 'completed',
      patternProgress: undefined,
      expenseStatus: 'pending',
      expenseProgress: '0/2 added',
    })

    const { getAllByText } = render(<GettingStartedScreen />)

    const startButtons = getAllByText('Start')
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
    mockUseGettingStarted.mockReturnValue({
      allTasksCompleted: true,
      patternStatus: 'completed',
      patternProgress: undefined,
      expenseStatus: 'completed',
      expenseProgress: undefined,
    })

    const { getByText } = render(<GettingStartedScreen />)

    expect(getByText('All done!')).toBeTruthy()
    expect(getByText('You are ready to start tracking your finances.')).toBeTruthy()
  })
})
