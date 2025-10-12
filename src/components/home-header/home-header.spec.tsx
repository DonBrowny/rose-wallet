import { render } from '@testing-library/react-native'
import React from 'react'
import { Animated } from 'react-native'
import { HomeHeader } from './home-header'

describe('HomeHeader', () => {
  let timingSpy: jest.SpyInstance
  let sequenceSpy: jest.SpyInstance

  beforeEach(() => {
    jest.useFakeTimers()
    timingSpy = jest.spyOn(Animated, 'timing').mockReturnValue({ start: jest.fn() } as any)
    sequenceSpy = jest.spyOn(Animated, 'sequence').mockReturnValue({ start: jest.fn() } as any)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('renders greeting texts and wave emoji', () => {
    const { getByText } = render(<HomeHeader />)
    expect(getByText('Hey,')).toBeTruthy()
    expect(getByText('Welcome back!')).toBeTruthy()
    expect(getByText('👋')).toBeTruthy()
  })

  it('starts wave animation sequence after 500ms', () => {
    render(<HomeHeader />)
    expect(timingSpy).not.toHaveBeenCalled()

    jest.advanceTimersByTime(500)

    expect(sequenceSpy).toHaveBeenCalled()
    expect(timingSpy).toHaveBeenCalledTimes(4)

    const configs = timingSpy.mock.calls.map(([, cfg]) => cfg)
    expect(configs[0]).toMatchObject({ toValue: 1, duration: 200, useNativeDriver: true })
    expect(configs[1]).toMatchObject({ toValue: 0, duration: 200, useNativeDriver: true })
  })
})
