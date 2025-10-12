import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { SmsReviewItem } from './sms-review-item'

describe('SmsReviewItem', () => {
  const baseProps = {
    id: '1',
    bankName: 'HDFC',
    date: new Date('2025-01-02T10:00:00Z').getTime(),
    messageBody: 'Debited INR 100 at STORE',
    merchant: 'STORE',
    amount: 100,
    amountValue: '100',
    merchantValue: 'STORE',
    onChangeAmount: jest.fn(),
    onChangeMerchant: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders bank name, date text, highlighted sms, and inputs', () => {
    const { getByText, getByTestId } = render(<SmsReviewItem {...baseProps} />)

    expect(getByText('Bank:')).toBeTruthy()
    expect(getByText('HDFC')).toBeTruthy()

    expect(getByTestId('highlighted-sms')).toBeTruthy()
    expect(getByText('Debited INR 100 at STORE')).toBeTruthy()
    expect(getByText('STORE')).toBeTruthy()
    expect(getByText('100')).toBeTruthy()

    expect(getByTestId('amount-input').props.value).toBe('100')
    expect(getByTestId('merchant-input').props.value).toBe('STORE')
  })

  it('calls change handlers when input values change', () => {
    const onChangeAmount = jest.fn()
    const onChangeMerchant = jest.fn()

    const { getByTestId } = render(
      <SmsReviewItem
        {...baseProps}
        onChangeAmount={onChangeAmount}
        onChangeMerchant={onChangeMerchant}
      />
    )

    fireEvent.changeText(getByTestId('amount-input'), '250')
    fireEvent.changeText(getByTestId('merchant-input'), 'NEW STORE')

    expect(onChangeAmount).toHaveBeenCalledWith('250')
    expect(onChangeMerchant).toHaveBeenCalledWith('NEW STORE')
  })
})
