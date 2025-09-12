import { theme } from '@/theme/rne-theme'
import { ThemeProvider } from '@rneui/themed'
import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { HomeHeader } from './home-header'

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

describe('HomeHeader', () => {
  it('renders with default props', () => {
    const { getByText } = renderWithTheme(<HomeHeader />)

    expect(getByText('Hi, Lou')).toBeTruthy()
    expect(getByText('Welcome back!')).toBeTruthy()
  })

  it('renders with custom userName', () => {
    const { getByText } = renderWithTheme(<HomeHeader userName='John' />)

    expect(getByText('Hi, John')).toBeTruthy()
    expect(getByText('Welcome back!')).toBeTruthy()
  })

  it('calls onMenuPress when menu button is pressed', () => {
    const mockOnMenuPress = jest.fn()
    const { getByTestId } = renderWithTheme(<HomeHeader onMenuPress={mockOnMenuPress} />)

    const menuButton = getByTestId('menu-button')
    fireEvent.press(menuButton)

    expect(mockOnMenuPress).toHaveBeenCalledTimes(1)
  })

  it('renders avatar with correct size', () => {
    const { getByTestId } = renderWithTheme(<HomeHeader />)

    const avatar = getByTestId('avatar')
    expect(avatar).toBeTruthy()
  })
})
