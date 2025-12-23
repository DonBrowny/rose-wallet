import { fireEvent, render } from '@testing-library/react-native'
import { SuccessState } from './success-state'

jest.mock('lottie-react-native', () => 'LottieView')

describe('SuccessState', () => {
  const mockOnButtonPress = jest.fn()
  const mockOnAnimationFinish = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders title correctly', () => {
    const { getByText } = render(<SuccessState title='All Done!' />)
    expect(getByText('All Done!')).toBeTruthy()
  })

  it('renders description when provided', () => {
    const { getByText } = render(
      <SuccessState
        title='All Done!'
        description='You have completed all tasks'
      />
    )
    expect(getByText('You have completed all tasks')).toBeTruthy()
  })

  it('does not render description when not provided', () => {
    const { queryByText } = render(<SuccessState title='All Done!' />)
    expect(queryByText('You have completed all tasks')).toBeNull()
  })

  it('does not render button when buttonTitle is not provided', () => {
    const { queryByText } = render(<SuccessState title='All Done!' />)
    expect(queryByText('Back to Home')).toBeNull()
  })

  it('renders button when buttonTitle and onButtonPress are provided', () => {
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
        buttonTitle='Continue'
        onButtonPress={mockOnButtonPress}
      />
    )
    fireEvent.press(getByText('Continue'))
    expect(mockOnButtonPress).toHaveBeenCalledTimes(1)
  })

  it('passes onAnimationFinish to LottieView', () => {
    const { UNSAFE_getByType } = render(
      <SuccessState
        title='All Done!'
        onAnimationFinish={mockOnAnimationFinish}
      />
    )
    const lottieView = UNSAFE_getByType('LottieView' as any)
    expect(lottieView.props.onAnimationFinish).toBe(mockOnAnimationFinish)
  })
})
