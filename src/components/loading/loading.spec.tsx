import { render } from '@testing-library/react-native'
import React from 'react'
import { Loading } from './loading'

describe('Loading', () => {
  it('renders default title, description, image and lottie', () => {
    const { getByText, getByTestId } = render(<Loading />)
    expect(getByText('Loading...')).toBeTruthy()
    expect(getByText('Please wait while we process your request')).toBeTruthy()
    expect(getByTestId('loading-image')).toBeTruthy()
    expect(getByTestId('lottie-view')).toBeTruthy()
  })

  it('renders custom title and description', () => {
    const { getByText } = render(
      <Loading
        title='Syncing'
        description='Almost there'
      />
    )
    expect(getByText('Syncing')).toBeTruthy()
    expect(getByText('Almost there')).toBeTruthy()
  })

  it('hides image when showImage is false', () => {
    const { queryByTestId } = render(<Loading showImage={false} />)
    expect(queryByTestId('loading-image')).toBeNull()
  })
})
