import { render } from '@testing-library/react-native'
import React from 'react'
import { HighlightedSMS } from './highlighted-sms'

describe('HighlightedSMS', () => {
  it('highlights both amount and merchant when present', () => {
    const amount = 1000
    const amountStr = amount.toLocaleString('en-IN')
    const { getAllByTestId, getByText, getByTestId } = render(
      <HighlightedSMS
        text={`Paid ${amountStr} at SWIGGY`}
        merchant='SWIGGY'
        amount={amount}
      />
    )
    expect(getByTestId('highlighted-sms')).toBeTruthy()
    const highlights = getAllByTestId('highlight')
    expect(highlights.length).toBe(2)
    expect(getByText('SWIGGY')).toBeTruthy()
    expect(getByText(amountStr)).toBeTruthy()
  })

  it('highlights only amount when merchant not found', () => {
    const amount = 250
    const amountStr = amount.toLocaleString('en-IN')
    const { getAllByTestId } = render(
      <HighlightedSMS
        text={`Amount ${amountStr} processed`}
        merchant='UNKNOWN'
        amount={amount}
      />
    )
    const highlights = getAllByTestId('highlight')
    expect(highlights.length).toBe(1)
  })

  it('highlights only merchant when amount not found', () => {
    const { getAllByTestId } = render(
      <HighlightedSMS
        text='Paid at STORE'
        merchant='STORE'
        amount={99999}
      />
    )
    const highlights = getAllByTestId('highlight')
    expect(highlights.length).toBe(1)
  })

  it('renders plain text when neither amount nor merchant matches', () => {
    const { queryAllByTestId, getByText } = render(
      <HighlightedSMS
        text='Hello world'
        merchant='STORE'
        amount={123}
      />
    )
    expect(queryAllByTestId('highlight').length).toBe(0)
    expect(getByText('Hello world')).toBeTruthy()
  })
})
