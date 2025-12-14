import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react-native'
import React from 'react'
import { HomeScreen } from './home-screen'

let queryClient: QueryClient

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
})

afterEach(() => {
  queryClient.clear()
})

function renderWithProviders(ui: React.ReactElement) {
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('HomeScreen', () => {
  it('renders header', () => {
    const { getByText } = renderWithProviders(<HomeScreen />)
    expect(getByText('Welcome back!')).toBeTruthy()
  })
  it('renders budget overview card', () => {
    const { getByText } = renderWithProviders(<HomeScreen />)
    expect(getByText('Budget Overview')).toBeTruthy()
  })
  it('renders recent expenses section', () => {
    const { getByText } = renderWithProviders(<HomeScreen />)
    expect(getByText('Recent Expenses')).toBeTruthy()
  })
})
