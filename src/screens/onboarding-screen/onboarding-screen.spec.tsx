import * as smsPermission from '@/services/sms-parsing/sms-permission-service'
import * as storageModule from '@/utils/mmkv/storage'
import { fireEvent, render } from '@testing-library/react-native'
import * as routerModule from 'expo-router'
import React from 'react'
import { OnboardingScreen } from './onboarding-screen'

jest.spyOn(smsPermission.SMSPermissionService, 'requestPermissionWithExplanation').mockResolvedValue({
  granted: true,
  canAskAgain: true,
  message: 'ok',
} as any)

jest.spyOn(storageModule, 'storage', 'get').mockReturnValue({
  set: jest.fn(),
} as any)

jest.spyOn(routerModule, 'useRouter').mockReturnValue({
  replace: jest.fn(),
} as any)

describe('OnboardingScreen', () => {
  it('renders first step and advances with Next', () => {
    const { getByText } = render(<OnboardingScreen />)
    expect(getByText('Welcome to Rose Wallet')).toBeTruthy()

    // Next from step 0
    fireEvent.press(getByText('Next'))
    // Now privacy step
    expect(getByText('Your Privacy')).toBeTruthy()
  })

  it('requests permission on privacy step Next', () => {
    const { getByText } = render(<OnboardingScreen />)
    fireEvent.press(getByText('Next'))
    fireEvent.press(getByText('Next'))
    expect(smsPermission.SMSPermissionService.requestPermissionWithExplanation).toHaveBeenCalled()
  })
})
