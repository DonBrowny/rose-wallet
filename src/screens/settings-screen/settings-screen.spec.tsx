import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render } from '@testing-library/react-native'
import { router } from 'expo-router'
import React from 'react'
import { SettingsScreen } from './settings-screen'

jest.mock('expo-router', () => ({ router: { navigate: jest.fn() } }))

// Mock the categories hook
jest.mock('@/hooks/use-categories', () => ({
  useGetFavoriteCategories: () => ({ data: [], isLoading: false }),
  useSetFavoriteCategories: () => ({ mutate: jest.fn() }),
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

function renderWithClient(ui: React.ReactElement) {
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('SettingsScreen', () => {
  it('renders settings items and navigates on press', () => {
    const { getByText } = renderWithClient(<SettingsScreen />)
    fireEvent.press(getByText('SMS Patterns'))
    expect(router.navigate as unknown as jest.Mock).toHaveBeenCalled()
  })
  it('renders About items and navigates on press', () => {
    const { getByText } = renderWithClient(<SettingsScreen />)
    fireEvent.press(getByText('About'))
    expect(router.navigate as unknown as jest.Mock).toHaveBeenCalledWith('/(tabs)/settings/about')
  })
})
