import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { BudgetEditModal } from './budget-edit-modal'

jest.mock('@/contexts/budget-context', () => ({
  useBudgetContext: () => ({ monthlyBudget: 1000, budgetChangeHandler: jest.fn() }),
}))

describe('BudgetEditModal', () => {
  it('renders overlay when visible with title and input', () => {
    const onCancel = jest.fn()
    const { getByTestId, getByText } = render(
      <BudgetEditModal
        isVisible={true}
        onCancel={onCancel}
      />
    )
    expect(getByText('Edit Monthly Budget')).toBeTruthy()
    expect(getByTestId('budget-input').props.value).toBe('1000')
  })

  it('updates input value and saves with valid positive number', () => {
    const onCancel = jest.fn()
    const { getByTestId, getByText } = render(
      <BudgetEditModal
        isVisible={true}
        onCancel={onCancel}
      />
    )
    const input = getByTestId('budget-input')
    fireEvent.changeText(input, '2500')
    fireEvent.press(getByText('Save Budget'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('resets value and calls onCancel on Cancel press', () => {
    const onCancel = jest.fn()
    const { getByTestId, getByText } = render(
      <BudgetEditModal
        isVisible={true}
        onCancel={onCancel}
      />
    )
    const input = getByTestId('budget-input')
    fireEvent.changeText(input, '0')
    fireEvent.press(getByText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })
})
