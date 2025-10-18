import { act, fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { OnboardingBudgetSetup, OnboardingBudgetSetupRef } from './onboarding-budget-setup'

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
    const ref = React.createRef<OnboardingBudgetSetupRef>()
    const { getByLabelText } = render(
      <OnboardingBudgetSetup
        ref={ref}
        onSaved={onSaved}
      />
    )
    const input = getByLabelText('Monthly Budget')
    fireEvent.changeText(input, '3500')
    act(() => {
      ref.current?.save()
    })
    expect(onSaved).toHaveBeenCalledWith(3500)
  })
})
