import { Expense } from '@/types/expense'
import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { DeleteExpenseContent } from './delete-expense-content'

const mockExpense: Expense = {
  id: 1,
  amount: 500,
  merchantName: 'Amazon',
  categoryName: 'Shopping',
  receivedAt: new Date('2024-01-15'),
}

describe('DeleteExpenseContent', () => {
  const defaultProps = {
    expense: mockExpense,
    onCancel: jest.fn(),
    onConfirm: jest.fn(),
    isDeleting: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders delete confirmation message with expense details', () => {
    const { getByText } = render(<DeleteExpenseContent {...defaultProps} />)

    expect(getByText('Delete Expense?')).toBeTruthy()
    expect(getByText(/Are you sure you want to delete this expense/)).toBeTruthy()
    expect(getByText(/Amazon/)).toBeTruthy()
  })

  it('calls onCancel when Cancel button is pressed', () => {
    const { getByText } = render(<DeleteExpenseContent {...defaultProps} />)

    fireEvent.press(getByText('Cancel'))

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirm when Delete button is pressed', () => {
    const { getByText } = render(<DeleteExpenseContent {...defaultProps} />)

    fireEvent.press(getByText('Delete'))

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('disables Cancel button when isDeleting is true', () => {
    const { getByText } = render(
      <DeleteExpenseContent
        {...defaultProps}
        isDeleting={true}
      />
    )

    const cancelButton = getByText('Cancel')
    expect(cancelButton).toBeTruthy()
  })
})
