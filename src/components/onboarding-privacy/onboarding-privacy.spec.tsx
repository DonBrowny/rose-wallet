import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { OnboardingPrivacy } from './onboarding-privacy'

describe('OnboardingPrivacy', () => {
  it('renders and triggers permission request', async () => {
    const { getByText } = render(<OnboardingPrivacy />)
    fireEvent.press(getByText(/Grant SMS Permission/))
  })
})
