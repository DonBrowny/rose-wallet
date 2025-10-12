import { render } from '@testing-library/react-native'
import React from 'react'
import { BudgetStatusIndicator } from './budget-status-indicator'

describe('BudgetStatusIndicator', () => {
  const jan7 = new Date('2025-01-07T12:00:00Z')

  it('shows Over state when weekly pace > 1.05', () => {
    const { getByText } = render(
      <BudgetStatusIndicator
        monthlyBudget={3100}
        totalExpense={800}
        currentDate={jan7}
      />
    )
    expect(getByText('Over · ₹800/w')).toBeTruthy()
  })

  it('shows Near state when weekly pace is close to target (>= 0.9)', () => {
    const { getByText } = render(
      <BudgetStatusIndicator
        monthlyBudget={3100}
        totalExpense={700}
        currentDate={jan7}
      />
    )
    expect(getByText('Near · ₹700/w')).toBeTruthy()
  })

  it('shows On state when weekly pace < 0.9', () => {
    const { getByText } = render(
      <BudgetStatusIndicator
        monthlyBudget={3100}
        totalExpense={500}
        currentDate={jan7}
      />
    )
    expect(getByText('On · ₹500/w')).toBeTruthy()
  })
})
