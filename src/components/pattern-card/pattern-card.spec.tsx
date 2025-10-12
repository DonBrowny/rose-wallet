import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { PatternCard } from './pattern-card'

describe('PatternCard', () => {
  it('renders template and approved status', () => {
    const onReview = jest.fn()
    const { getByText } = render(
      <PatternCard
        template='Paid ₹100 at STORE'
        status='approved'
        onReview={onReview}
      />
    )
    expect(getByText('Paid ₹100 at STORE')).toBeTruthy()
    expect(getByText('Approved')).toBeTruthy()
    expect(getByText('Review Pattern')).toBeTruthy()
    expect(getByText('Reject')).toBeTruthy()
  })

  it('renders action needed status when not approved', () => {
    const onReview = jest.fn()
    const { getByText } = render(
      <PatternCard
        template='Txn template'
        status='needs-review'
        onReview={onReview}
      />
    )
    expect(getByText('Action Needed')).toBeTruthy()
  })

  it('calls onReview when "Review Pattern" is pressed', () => {
    const onReview = jest.fn()
    const { getByText } = render(
      <PatternCard
        template='Template'
        status='approved'
        onReview={onReview}
      />
    )
    fireEvent.press(getByText('Review Pattern'))
    expect(onReview).toHaveBeenCalledTimes(1)
  })
})
