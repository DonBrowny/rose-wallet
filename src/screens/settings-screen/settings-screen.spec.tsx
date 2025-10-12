import { fireEvent, render } from '@testing-library/react-native'
import { router } from 'expo-router'
import React from 'react'
import { SettingsScreen } from './settings-screen'

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }))

describe('SettingsScreen', () => {
  it('renders settings items and navigates on press', () => {
    const { getByText } = render(<SettingsScreen />)
    fireEvent.press(getByText('SMS Patterns'))
    expect(router.push as unknown as jest.Mock).toHaveBeenCalled()
  })
  it('renders About items and navigates on press', () => {
    const { getByText } = render(<SettingsScreen />)
    fireEvent.press(getByText('About'))
    expect(router.push as unknown as jest.Mock).toHaveBeenCalledWith('/(tabs)/settings/about')
  })
})
