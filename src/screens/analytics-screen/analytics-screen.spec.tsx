import { render } from '@testing-library/react-native'
import React from 'react'
import { AnalyticsScreen } from './analytics-screen'

jest.mock('expo-image', () => ({
  Image: () => null,
}))

describe('AnalyticsScreen', () => {
  it('renders under construction content', () => {
    const { getByText } = render(<AnalyticsScreen />)
    expect(getByText('Under Construction')).toBeTruthy()
  })
})
