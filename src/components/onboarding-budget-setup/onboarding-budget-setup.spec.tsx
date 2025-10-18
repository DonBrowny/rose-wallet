import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { OnboardingBudgetSetup } from './onboarding-budget-setup'

jest.mock('@/contexts/budget-context', () => ({
  useBudgetContext: () => ({ monthlyBudget: 2000, budgetChangeHandler: jest.fn() }),
}))

describe('OnboardingBudgetSetup', () => {
  it('renders with default budget and validates input', () => {
    const { getByLabelText } = render(<OnboardingBudgetSetup />)
    const input = getByLabelText('Monthly Budget')
    expect(input.props.value).toBe('2000')
  })

  it('calls onSaved when saving valid budget', () => {
    const onSaved = jest.fn()
    const { getByLabelText, getByText } = render(<OnboardingBudgetSetup onSaved={onSaved} />)
    const input = getByLabelText('Monthly Budget')
    fireEvent.changeText(input, '3500')
    fireEvent.press(getByText('Save Budget'))
    expect(onSaved).toHaveBeenCalledWith(3500)
  })
})
