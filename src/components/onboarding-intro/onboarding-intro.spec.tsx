import { render } from '@testing-library/react-native'
import React from 'react'
import { OnboardingIntro } from './onboarding-intro'

describe('OnboardingIntro', () => {
  it('renders title and description', () => {
    const { getByText } = render(<OnboardingIntro />)
    expect(getByText('Welcome to Rose Wallet')).toBeTruthy()
    expect(getByText(/Track expenses from SMS/)).toBeTruthy()
  })
})
