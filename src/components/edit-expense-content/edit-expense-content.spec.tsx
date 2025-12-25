import { Expense } from '@/types/expense'
import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { EditExpenseContent } from './edit-expense-content'

const mockExpense: Expense = {
  id: 1,
  amount: 500,
  merchantName: 'Amazon',
  categoryName: 'Shopping',
  receivedAt: new Date('2024-01-15'),
}

const mockExpenseWithSms: Expense = {
  ...mockExpense,
  smsSender: 'HDFC-Bank',
  smsBody: 'Rs 500 debited from your account for Amazon purchase',
}

describe('EditExpenseContent', () => {
  const defaultProps = {
    expense: mockExpense,
    amount: '500',
    merchantName: 'Amazon',
    categoryName: 'Shopping',
    onAmountChange: jest.fn(),
    onMerchantChange: jest.fn(),
    onCategoryChange: jest.fn(),
    onDelete: jest.fn(),
    onSave: jest.fn(),
    isSaving: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders edit form with title', () => {
    const { getByText } = render(<EditExpenseContent {...defaultProps} />)

    expect(getByText('Edit Expense')).toBeTruthy()
  })

  it('renders input fields with correct values', () => {
    const { getByTestId } = render(<EditExpenseContent {...defaultProps} />)

    expect(getByTestId('merchant-input')).toBeTruthy()
    expect(getByTestId('category-input')).toBeTruthy()
    expect(getByTestId('amount-input')).toBeTruthy()
  })

  it('calls onMerchantChange when merchant input changes', () => {
    const { getByTestId } = render(<EditExpenseContent {...defaultProps} />)

    fireEvent.changeText(getByTestId('merchant-input'), 'New Merchant')

    expect(defaultProps.onMerchantChange).toHaveBeenCalledWith('New Merchant')
  })

  it('calls onCategoryChange when category input changes', () => {
    const { getByTestId } = render(<EditExpenseContent {...defaultProps} />)

    fireEvent.changeText(getByTestId('category-input'), 'New Category')

    expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('New Category')
  })

  it('calls onAmountChange when amount input changes', () => {
    const { getByTestId } = render(<EditExpenseContent {...defaultProps} />)

    fireEvent.changeText(getByTestId('amount-input'), '1000')

    expect(defaultProps.onAmountChange).toHaveBeenCalledWith('1000')
  })

  it('calls onDelete when Delete button is pressed', () => {
    const { getByText } = render(<EditExpenseContent {...defaultProps} />)

    fireEvent.press(getByText('Delete'))

    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1)
  })

  it('calls onSave when Save button is pressed', () => {
    const { getByText } = render(<EditExpenseContent {...defaultProps} />)

    fireEvent.press(getByText('Save'))

    expect(defaultProps.onSave).toHaveBeenCalledTimes(1)
  })

  it('renders SMS section when expense has SMS data', () => {
    const { getByText } = render(
      <EditExpenseContent
        {...defaultProps}
        expense={mockExpenseWithSms}
      />
    )

    expect(getByText('HDFC-Bank')).toBeTruthy()
    expect(getByText(/Rs 500 debited/)).toBeTruthy()
  })

  it('does not render SMS section when expense has no SMS data', () => {
    const { queryByText } = render(<EditExpenseContent {...defaultProps} />)

    expect(queryByText('HDFC-Bank')).toBeNull()
  })
})
