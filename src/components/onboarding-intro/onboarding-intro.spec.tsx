import { render } from '@testing-library/react-native'
import React from 'react'
import { OnboardingIntro } from './onboarding-intro'

describe('OnboardingIntro', () => {
  it('renders title and description', () => {
    const { getByText } = render(<OnboardingIntro />)
    expect(getByText('Hi, I am Rose')).toBeTruthy()
    expect(getByText('I will help you to track expenses from SMS and manage budgets.')).toBeTruthy()
  })
})
