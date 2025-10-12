import { render } from '@testing-library/react-native'
import React from 'react'
import { AboutScreen } from './about-screen'

describe('AboutScreen', () => {
  it('renders version, description, features and privacy', () => {
    const { getByText } = render(<AboutScreen />)
    expect(getByText('Version')).toBeTruthy()
    expect(getByText('Description')).toBeTruthy()
    expect(getByText('Features')).toBeTruthy()
    expect(getByText('Privacy')).toBeTruthy()
  })
})
