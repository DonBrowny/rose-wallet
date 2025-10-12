import { useLivePatterns } from '@/hooks/use-live-patterns'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import React from 'react'
import { PatternsScreen } from './patterns-screen'

import { upsertPatternsByGrouping } from '@/services/database/patterns-repository'
import { SMSService } from '@/services/sms-parsing/sms-service'
import { useMMKVBoolean, useMMKVObject } from 'react-native-mmkv'

jest.mock('expo-router', () => ({ useRouter: jest.fn() }))

jest.mock('@/hooks/use-live-patterns', () => ({ useLivePatterns: jest.fn() }))

jest.mock('react-native-mmkv', () => ({
  useMMKVBoolean: jest.fn(),
  useMMKVObject: jest.fn(),
}))

jest.mock('@/services/sms-parsing/sms-service', () => ({
  SMSService: { getDistinctSMSMessagesLastNDays: jest.fn() },
}))
jest.mock('@/services/database/patterns-repository', () => ({
  upsertPatternsByGrouping: jest.fn(),
}))

describe('PatternsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('runs discovery flow when not completed and succeeds', async () => {
    const setCompleted = jest.fn()
    ;(useMMKVBoolean as unknown as jest.Mock).mockReturnValue([false, setCompleted])

    const setSamples = jest.fn()
    ;(useMMKVObject as unknown as jest.Mock).mockReturnValue([{}, setSamples])
    ;(SMSService.getDistinctSMSMessagesLastNDays as unknown as jest.Mock).mockResolvedValue({
      success: true,
      distinctPatterns: [
        { id: '1', template: 'T1', groupingTemplate: 'G1', status: 'approved', transactions: [{ id: 't1' }] },
        { id: '2', template: 'T2', groupingTemplate: 'G2', status: 'approved', transactions: [{ id: 't2' }] },
      ],
      transactions: [],
      totalSMSRead: 0,
      totalTransactions: 0,
      totalPatterns: 2,
      errors: [],
    })
    ;(useLivePatterns as unknown as jest.Mock).mockReturnValue({ data: [] })
    ;(useRouter as unknown as jest.Mock).mockReturnValue({ push: jest.fn() })

    render(<PatternsScreen />)

    await waitFor(() => {
      expect(upsertPatternsByGrouping).toHaveBeenCalled()
      expect(setSamples).toHaveBeenCalled()
      expect(setCompleted).toHaveBeenCalledWith(true)
    })
  })

  it('shows error when discovery fails', async () => {
    ;(useMMKVBoolean as unknown as jest.Mock).mockReturnValue([false, jest.fn()])
    ;(useMMKVObject as unknown as jest.Mock).mockReturnValue([{}, jest.fn()])
    ;(SMSService.getDistinctSMSMessagesLastNDays as unknown as jest.Mock).mockResolvedValue({
      success: false,
      distinctPatterns: [],
      transactions: [],
      totalSMSRead: 0,
      totalTransactions: 0,
      totalPatterns: 0,
      errors: ['boom'],
    })
    ;(useLivePatterns as unknown as jest.Mock).mockReturnValue({ data: [] })
    ;(useRouter as unknown as jest.Mock).mockReturnValue({ push: jest.fn() })

    const { findByText } = render(<PatternsScreen />)
    expect(await findByText('Error Loading Patterns')).toBeTruthy()
    expect(await findByText('boom')).toBeTruthy()
  })

  it('renders patterns list on subsequent loads and navigates to review on press', async () => {
    ;(useMMKVBoolean as unknown as jest.Mock).mockReturnValue([true, jest.fn()])
    ;(useMMKVObject as unknown as jest.Mock).mockReturnValue([{}, jest.fn()])
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
  })
})
