import { render } from '@testing-library/react-native'
import React from 'react'
import { HomeScreen } from './home-screen'

describe('HomeScreen', () => {
  it('renders header', () => {
    const { getByText } = render(<HomeScreen />)
    expect(getByText('Welcome back!')).toBeTruthy()
  })
  it('renders budget overview card', () => {
    const { getByText } = render(<HomeScreen />)
    expect(getByText('Budget Overview')).toBeTruthy()
  })
  it('renders recent expenses section', () => {
    const { getByText } = render(<HomeScreen />)
    expect(getByText('Recent Expenses')).toBeTruthy()
  })
})
