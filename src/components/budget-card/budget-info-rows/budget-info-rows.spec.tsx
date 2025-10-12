import { fireEvent, render } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import React from 'react'
import { BudgetInfoRows } from './budget-info-rows'

jest.mock('@/contexts/budget-context', () => ({
  useBudgetContext: () => ({ monthlyBudget: 1000, budgetChangeHandler: jest.fn() }),
}))

jest.mock('expo-router', () => ({ useRouter: jest.fn() }))

describe('BudgetInfoRows', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders labels and formatted values', () => {
    const { getByText } = render(
      <BudgetInfoRows
        spentFormatted='₹1,000'
        budgetFormatted='₹5,000'
        isOverBudget={false}
      />
    )
    expect(getByText('Monthly Expense')).toBeTruthy()
    expect(getByText('₹1,000')).toBeTruthy()
    expect(getByText('Monthly Budget')).toBeTruthy()
    expect(getByText('₹5,000')).toBeTruthy()
  })

  it('navigates to analytics when Monthly Expense row is pressed', () => {
    const push = jest.fn()
    ;(useRouter as unknown as jest.Mock).mockReturnValue({ push })

    const { getByText } = render(
      <BudgetInfoRows
        spentFormatted='₹1,000'
        budgetFormatted='₹5,000'
        isOverBudget={false}
      />
    )

    fireEvent.press(getByText('Monthly Expense'))
    expect(push).toHaveBeenCalledWith('/analytics')
  })

  it('opens the budget edit modal when Monthly Budget row is pressed', () => {
    const push = jest.fn()
    ;(useRouter as unknown as jest.Mock).mockReturnValue({ push })

    const { getByText, queryByText } = render(
      <BudgetInfoRows
        spentFormatted='₹1,000'
        budgetFormatted='₹5,000'
        isOverBudget={false}
      />
    )

    expect(queryByText('Edit Monthly Budget')).toBeNull()

    fireEvent.press(getByText('Monthly Budget'))

    expect(getByText('Edit Monthly Budget')).toBeTruthy()
  })
})
