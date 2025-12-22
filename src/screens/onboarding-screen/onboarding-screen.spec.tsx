import * as categoriesRepository from '@/services/database/categories-repository'
import * as smsPermission from '@/services/sms-parsing/sms-permission-service'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import { storage } from '@/utils/mmkv/storage'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import * as routerModule from 'expo-router'
import React from 'react'
import { OnboardingScreen } from './onboarding-screen'

// Mock the ESM native module to avoid transform issues in Jest
jest.mock('rose-sms-reader', () => ({
  checkSMSPermission: jest.fn(async () => ({ granted: true, canAskAgain: true, message: 'ok' })),
  requestSMSPermission: jest.fn(async () => ({ granted: true, canAskAgain: true, message: 'ok' })),
  isAvailable: jest.fn(async () => true),
  readSMS: jest.fn(async () => []),
}))

// Mock MMKV storage module
jest.mock('@/utils/mmkv/storage', () => ({
  storage: { set: jest.fn(), getBoolean: jest.fn(() => undefined) },
}))

// Mock categories repository
jest.spyOn(categoriesRepository, 'setFavoriteCategories').mockResolvedValue([])

jest.spyOn(smsPermission.SMSPermissionService, 'requestPermissionWithExplanation').mockResolvedValue({
  granted: true,
  canAskAgain: true,
  message: 'ok',
} as any)

const replaceMock = jest.fn()
jest.spyOn(routerModule, 'useRouter').mockReturnValue({ replace: replaceMock } as any)

describe('OnboardingScreen', () => {
  it('renders first step and advances with Get Started', async () => {
    const { getByText } = render(<OnboardingScreen />)
    expect(getByText('Hi, I am Rose')).toBeTruthy()

    // Advance from step 0 using Get Started
    await act(async () => {
      fireEvent.press(getByText('Get Started'))
    })
    // Now privacy step
    expect(getByText('Privacy & Data Security')).toBeTruthy()
  })

  it('requests permission on privacy step Next', async () => {
    const { getByText } = render(<OnboardingScreen />)
    await act(async () => {
      fireEvent.press(getByText('Get Started'))
    })
    await act(async () => {
      fireEvent.press(getByText('Next'))
    })
    await waitFor(() => expect(smsPermission.SMSPermissionService.requestPermissionWithExplanation).toHaveBeenCalled())
  })

  it('completes all steps and finishes onboarding', async () => {
    const { getByText, getByLabelText } = render(<OnboardingScreen />)

    // Step 0 -> Step 1 (Privacy)
    await act(async () => {
      fireEvent.press(getByText('Get Started'))
    })

    // Step 1 -> Step 2 (Categories)
    await act(async () => {
      fireEvent.press(getByText('Next'))
    })

    // Now on step 2: categories selection
    expect(getByText('Quick Categories')).toBeTruthy()

    // Select 4 categories
    await act(async () => {
      fireEvent.press(getByText('Transportation'))
    })
    await act(async () => {
      fireEvent.press(getByText('Food'))
    })
    await act(async () => {
      fireEvent.press(getByText('Groceries'))
    })
    await act(async () => {
      fireEvent.press(getByText('Utilities'))
    })

    // Step 2 -> Step 3 (Budget)
    await act(async () => {
      fireEvent.press(getByText('Next'))
    })

    // Wait for categories to be saved and step to advance
    await waitFor(() => {
      expect(getByText('Set Your Monthly Budget')).toBeTruthy()
    })

    const input = getByLabelText('Monthly Budget')
    await act(async () => {
      fireEvent.changeText(input, '4500')
    })

    await act(async () => {
      fireEvent.press(getByText('Finish'))
    })

    expect(storage.set).toHaveBeenCalledWith(MMKV_KEYS.APP.ONBOARDING_COMPLETED, true)
    expect(replaceMock).toHaveBeenCalledWith('/(shared)/getting-started')
  })
})
