import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { Animated, Text } from 'react-native'
import { TabBarButton } from './tab-bar-button'

describe('TabBarButton', () => {
  let springSpy: jest.SpyInstance

  beforeEach(() => {
    springSpy = jest.spyOn(Animated, 'spring').mockReturnValue({
      start: jest.fn(),
      stop: jest.fn(),
    } as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders children', () => {
    const { getByText } = render(
      <TabBarButton
        accessibilityState={{ selected: false }}
        onPress={jest.fn()}
      >
        <Text>Child</Text>
      </TabBarButton>
    )
    expect(getByText('Child')).toBeTruthy()
  })

  it('triggers active scale animation on focus change', () => {
    render(
      <TabBarButton
        accessibilityState={{ selected: true }}
        onPress={jest.fn()}
      >
        <Text>Icon</Text>
      </TabBarButton>
    )
    const hasFocusAnim = springSpy.mock.calls.some(([, cfg]) => cfg?.toValue === 1.1)
    expect(hasFocusAnim).toBe(true)
  })

  it('animates scale on press in and out', () => {
    const { getByTestId } = render(
      <TabBarButton
        accessibilityState={{ selected: false }}
        onPress={jest.fn()}
        testID='tab-btn'
      >
        <Text>Icon</Text>
      </TabBarButton>
    )

    fireEvent(getByTestId('tab-btn'), 'pressIn')
    expect(springSpy.mock.calls.some(([, cfg]) => cfg?.toValue === 0.95)).toBe(true)

    fireEvent(getByTestId('tab-btn'), 'pressOut')
    expect(springSpy.mock.calls.some(([, cfg]) => cfg?.toValue === 1)).toBe(true)
  })

  it('forwards ref to underlying Pressable', () => {
    const ref = React.createRef<any>()
    render(
      <TabBarButton
        accessibilityState={{ selected: false }}
        onPress={jest.fn()}
        ref={ref}
        testID='tab-btn-ref'
      >
        <Text>Icon</Text>
      </TabBarButton>
    )
    expect(ref.current).toBeTruthy()
  })
})
