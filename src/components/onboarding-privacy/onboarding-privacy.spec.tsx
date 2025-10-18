import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { OnboardingPrivacy } from './onboarding-privacy'

describe('OnboardingPrivacy', () => {
  it('renders static content', () => {
    const { getByText } = render(<OnboardingPrivacy />)
    expect(getByText('Privacy & Data Security')).toBeTruthy()
  })

  it('opens and closes the SMS info overlay', () => {
    const { getByText, queryByText } = render(<OnboardingPrivacy />)

    expect(queryByText('Why we need SMS access')).toBeNull()

    fireEvent.press(getByText('know why we read your SMS?'))
    expect(getByText('Why we need SMS access')).toBeTruthy()

    fireEvent.press(getByText('Got it'))
    expect(queryByText('Why we need SMS access')).toBeNull()
  })
})
