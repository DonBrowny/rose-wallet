import { fireEvent, render } from '@testing-library/react-native'
import { Fab } from './fab'

const mockPush = jest.fn()
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }))

describe('Fab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    const { getByRole } = render(<Fab />)
    expect(getByRole('button')).toBeTruthy()
  })

  it('has correct accessibility label', () => {
    const { getByLabelText } = render(<Fab />)
    expect(getByLabelText('Add expense')).toBeTruthy()
  })

  it('navigates to add-expense on press', () => {
    const { getByRole } = render(<Fab />)
    fireEvent.press(getByRole('button'))
    expect(mockPush).toHaveBeenCalledWith('/(shared)/add-expense')
  })

  it('renders when visible is true', () => {
    const { getByRole } = render(<Fab visible={true} />)
    expect(getByRole('button')).toBeTruthy()
  })

  it('renders when visible is false', () => {
    const { getByRole } = render(<Fab visible={false} />)
    // Component still renders but with scale animation at 0
    expect(getByRole('button')).toBeTruthy()
  })
})
