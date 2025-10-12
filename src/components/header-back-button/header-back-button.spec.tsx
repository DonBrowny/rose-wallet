import { fireEvent, render } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import React from 'react'
import { HeaderBackButton } from './header-back-button'

jest.mock('expo-router', () => ({ useRouter: jest.fn() }))

describe('HeaderBackButton', () => {
  it('renders the back icon with testID', () => {
    const { getAllByTestId } = render(<HeaderBackButton />)
    expect(getAllByTestId('header-back-icon')).toBeTruthy()
  })

  it('calls router.back by default, falls back to replace on error', () => {
    const mockRouter = { back: jest.fn(), replace: jest.fn() }
    ;(useRouter as unknown as jest.Mock).mockReturnValue(mockRouter)

    const { getByTestId, rerender } = render(<HeaderBackButton />)
    fireEvent.press(getByTestId('header-back-button'))
    expect(mockRouter.back).toHaveBeenCalled()

    mockRouter.back.mockImplementationOnce(() => {
      throw new Error('fail')
    })
    ;(useRouter as unknown as jest.Mock).mockReturnValue(mockRouter)
    rerender(<HeaderBackButton />)
    fireEvent.press(getByTestId('header-back-button'))
    expect(mockRouter.replace).toHaveBeenCalledWith('/')
  })

  it('prefers custom onPress over router back', () => {
    const onPress = jest.fn()
    const { getByTestId } = render(<HeaderBackButton onPress={onPress} />)
    fireEvent.press(getByTestId('header-back-button'))
    expect(onPress).toHaveBeenCalled()
  })
})
