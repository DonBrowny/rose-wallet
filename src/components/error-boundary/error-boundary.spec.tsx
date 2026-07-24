import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { Text } from 'react-native'
import { ErrorBoundary } from './error-boundary'

function ThrowingChild(): React.ReactElement {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>All good</Text>
      </ErrorBoundary>
    )

    expect(getByText('All good')).toBeTruthy()
  })

  it('renders the fallback UI when a child throws', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    )

    expect(getByText('Something went wrong')).toBeTruthy()
    expect(getByText('Try again')).toBeTruthy()
  })

  it('reports the caught error', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Unhandled error caught by ErrorBoundary',
      expect.any(Error),
      expect.anything()
    )
  })

  it('resets and retries rendering children when "Try again" is pressed', () => {
    let shouldThrow = true
    function MaybeThrow() {
      if (shouldThrow) throw new Error('boom')
      return <Text>Recovered</Text>
    }

    const { getByText } = render(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>
    )

    expect(getByText('Something went wrong')).toBeTruthy()

    shouldThrow = false
    fireEvent.press(getByText('Try again'))

    expect(getByText('Recovered')).toBeTruthy()
  })
})
