import { render } from '@testing-library/react-native'
import React from 'react'
import { PillStatus, StatusPill } from './status-pill'

describe('StatusPill', () => {
  it('renders Completed label for completed status', () => {
    const { getByText } = render(<StatusPill status='completed' />)

    expect(getByText('Completed')).toBeTruthy()
  })

  it('renders Not started label for pending status', () => {
    const { getByText } = render(<StatusPill status='pending' />)

    expect(getByText('Not started')).toBeTruthy()
  })

  it('renders Locked label for locked status', () => {
    const { getByText } = render(<StatusPill status='locked' />)

    expect(getByText('Locked')).toBeTruthy()
  })

  it('renders Rejected label for rejected status', () => {
    const { getByText } = render(<StatusPill status='rejected' />)

    expect(getByText('Rejected')).toBeTruthy()
  })

  it.each<PillStatus>(['completed', 'pending', 'locked', 'rejected'])('renders correctly for %s status', (status) => {
    const { toJSON } = render(<StatusPill status={status} />)

    expect(toJSON()).toBeTruthy()
  })
})
