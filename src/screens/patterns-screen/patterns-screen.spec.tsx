import { useLivePatterns } from '@/hooks/use-live-patterns'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import React from 'react'
import { PatternsScreen } from './patterns-screen'

import { PatternDiscoveryService } from '@/services/sms-parsing/pattern-discovery-service'
import { useMMKVBoolean } from 'react-native-mmkv'

jest.mock('expo-router', () => ({ useRouter: jest.fn() }))

jest.mock('@/hooks/use-live-patterns', () => ({ useLivePatterns: jest.fn() }))

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}))

jest.mock('react-native-mmkv', () => ({
  useMMKVBoolean: jest.fn(),
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    getBoolean: jest.fn(),
    clearAll: jest.fn(),
  })),
}))

jest.mock('@/services/sms-parsing/pattern-discovery-service', () => ({
  PatternDiscoveryService: { discoverFromLastNDays: jest.fn() },
}))
jest.mock('@/services/database/patterns-repository', () => ({
  updatePatternStatusById: jest.fn(),
}))

const mockDiscover = PatternDiscoveryService.discoverFromLastNDays as jest.Mock

describe('PatternsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('runs discovery flow when not completed and succeeds', async () => {
    const setCompleted = jest.fn()
    ;(useMMKVBoolean as unknown as jest.Mock).mockReturnValue([false, setCompleted])
    mockDiscover.mockResolvedValue({ patternsFound: 2 })
    ;(useLivePatterns as unknown as jest.Mock).mockReturnValue({ data: [] })
    ;(useRouter as unknown as jest.Mock).mockReturnValue({ push: jest.fn() })

    render(<PatternsScreen />)

    await waitFor(() => {
      expect(mockDiscover).toHaveBeenCalledWith(60)
      expect(setCompleted).toHaveBeenCalledWith(true)
    })
  })

  it('shows error when discovery fails', async () => {
    ;(useMMKVBoolean as unknown as jest.Mock).mockReturnValue([false, jest.fn()])
    mockDiscover.mockRejectedValue(new Error('boom'))
    ;(useLivePatterns as unknown as jest.Mock).mockReturnValue({ data: [] })
    ;(useRouter as unknown as jest.Mock).mockReturnValue({ push: jest.fn() })

    const { findByText } = render(<PatternsScreen />)
    expect(await findByText('Error Loading Patterns')).toBeTruthy()
    expect(await findByText('boom')).toBeTruthy()
  })

  it('renders patterns list on subsequent loads and navigates to review on press', async () => {
    ;(useMMKVBoolean as unknown as jest.Mock).mockReturnValue([true, jest.fn()])
    ;(useLivePatterns as unknown as jest.Mock).mockReturnValue({
      data: [
        { id: '1', template: 'Temp 1', status: 'approved' },
        { id: '2', template: 'Temp 2', status: 'needs-review' },
      ],
    })
    const push = jest.fn()
    ;(useRouter as unknown as jest.Mock).mockReturnValue({ push })

    const { getAllByText } = render(<PatternsScreen />)
    const reviewButtons = getAllByText('Review Pattern')
    expect(reviewButtons.length).toBeGreaterThan(0)
    fireEvent.press(reviewButtons[0])
    expect(push).toHaveBeenCalled()

    await waitFor(() => {
      expect(mockDiscover).not.toHaveBeenCalled()
    })
  })
})
