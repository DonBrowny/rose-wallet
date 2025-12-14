import { fireEvent, render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { IconButton } from './icon-button'

describe('IconButton', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <IconButton>
        <Text>Test Child</Text>
      </IconButton>
    )
    expect(getByText('Test Child')).toBeTruthy()
  })

  it('calls onPress when pressed', () => {
    const onPress = jest.fn()
    const { getByText } = render(
      <IconButton onPress={onPress}>
        <Text>Press Me</Text>
      </IconButton>
    )
    fireEvent.press(getByText('Press Me'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn()
    const { getByText } = render(
      <IconButton
        onPress={onPress}
        disabled
      >
        <Text>Disabled Button</Text>
      </IconButton>
    )
    fireEvent.press(getByText('Disabled Button'))
    expect(onPress).not.toHaveBeenCalled()
  })

  it('passes testID to pressable', () => {
    const { getByTestId } = render(
      <IconButton testID='icon-btn'>
        <Text>Test</Text>
      </IconButton>
    )
    expect(getByTestId('icon-btn')).toBeTruthy()
  })

  it('applies custom style prop', () => {
    const customStyle = { marginTop: 10 }
    const { getByTestId } = render(
      <IconButton
        testID='styled-btn'
        style={customStyle}
      >
        <Text>Styled</Text>
      </IconButton>
    )
    const button = getByTestId('styled-btn')
    expect(button.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ marginTop: 10 })]))
  })
})
