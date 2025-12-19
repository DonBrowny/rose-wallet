import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { TourCard } from './tour-card'

describe('TourCard', () => {
  const defaultProps = {
    title: 'Test Tour',
    description: 'Test description',
    status: 'pending' as const,
    buttonTitle: 'Start',
    onPress: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders title and description', () => {
    const { getByText } = render(<TourCard {...defaultProps} />)

    expect(getByText('Test Tour')).toBeTruthy()
    expect(getByText('Test description')).toBeTruthy()
  })

  it('renders button with correct title', () => {
    const { getByText } = render(<TourCard {...defaultProps} />)

    expect(getByText('Start')).toBeTruthy()
  })

  it('calls onPress when button is pressed', () => {
    const mockOnPress = jest.fn()
    const { getByText } = render(
      <TourCard
        {...defaultProps}
        onPress={mockOnPress}
      />
    )

    fireEvent.press(getByText('Start'))
    expect(mockOnPress).toHaveBeenCalledTimes(1)
  })

  it('renders hint when provided', () => {
    const { getByText } = render(
      <TourCard
        {...defaultProps}
        hint='This is a hint'
      />
    )

    expect(getByText('This is a hint')).toBeTruthy()
  })

  it('does not render hint when not provided', () => {
    const { queryByText } = render(<TourCard {...defaultProps} />)

    expect(queryByText('This is a hint')).toBeNull()
  })

  it('renders StatusPill with correct status', () => {
    const { getByText } = render(
      <TourCard
        {...defaultProps}
        status='completed'
      />
    )

    expect(getByText('Completed')).toBeTruthy()
  })

  it('renders with locked status', () => {
    const { getByText } = render(
      <TourCard
        {...defaultProps}
        status='locked'
        locked={true}
      />
    )

    expect(getByText('Locked')).toBeTruthy()
  })

  it('renders with different button titles based on completion', () => {
    const { getByText, rerender } = render(
      <TourCard
        {...defaultProps}
        status='pending'
        buttonTitle='Start tour'
      />
    )

    expect(getByText('Start tour')).toBeTruthy()

    rerender(
      <TourCard
        {...defaultProps}
        status='completed'
        buttonTitle='View again'
      />
    )

    expect(getByText('View again')).toBeTruthy()
  })
})
