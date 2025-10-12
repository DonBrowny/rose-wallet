import { render } from '@testing-library/react-native'
import React from 'react'
import { SettingsItem } from './settings-item'

describe('SettingsItem', () => {
  it('renders header and subHeader text', () => {
    const { getByText } = render(
      <SettingsItem
        header='Title'
        subHeader='Subtitle'
      />
    )
    expect(getByText('Title')).toBeTruthy()
    expect(getByText('Subtitle')).toBeTruthy()
  })

  it('renders the chevron icon with testID', () => {
    const { getAllByTestId } = render(
      <SettingsItem
        header='A'
        subHeader='B'
      />
    )
    const chevrons = getAllByTestId('chevron-right')
    expect(chevrons.length).toBeGreaterThanOrEqual(1)
  })
})
