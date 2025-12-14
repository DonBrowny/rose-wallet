import { fireEvent, render } from '@testing-library/react-native'
import { SuccessState } from './success-state'

jest.mock('lottie-react-native', () => 'LottieView')

describe('SuccessState', () => {
  const mockOnButtonPress = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders title correctly', () => {
    const { getByText } = render(
      <SuccessState
        title='All Done!'
        onButtonPress={mockOnButtonPress}
      />
    )
    expect(getByText('All Done!')).toBeTruthy()
  })

  it('renders description when provided', () => {
    const { getByText } = render(
      <SuccessState
        title='All Done!'
        description='You have completed all tasks'
        onButtonPress={mockOnButtonPress}
      />
    )
    expect(getByText('You have completed all tasks')).toBeTruthy()
  })

  it('does not render description when not provided', () => {
    const { queryByText } = render(
      <SuccessState
        title='All Done!'
        onButtonPress={mockOnButtonPress}
      />
    )
    expect(queryByText('You have completed all tasks')).toBeNull()
  })

  it('renders default button title', () => {
    const { getByText } = render(
      <SuccessState
        title='All Done!'
        onButtonPress={mockOnButtonPress}
      />
    )
    expect(getByText('Back to Home')).toBeTruthy()
  })

  it('renders custom button title', () => {
    const { getByText } = render(
      <SuccessState
        title='All Done!'
        buttonTitle='Continue'
        onButtonPress={mockOnButtonPress}
      />
    )
    expect(getByText('Continue')).toBeTruthy()
  })

  it('calls onButtonPress when button is pressed', () => {
    const { getByText } = render(
      <SuccessState
        title='All Done!'
        onButtonPress={mockOnButtonPress}
      />
    )
    fireEvent.press(getByText('Back to Home'))
    expect(mockOnButtonPress).toHaveBeenCalledTimes(1)
  })
})
