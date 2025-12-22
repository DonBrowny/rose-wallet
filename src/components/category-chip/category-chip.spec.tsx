import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { CategoryChip } from './category-chip'

describe('CategoryChip', () => {
  const mockOnPress = jest.fn()

  beforeEach(() => {
    mockOnPress.mockClear()
  })

  it('renders the label text', () => {
    const { getByText } = render(
      <CategoryChip
        label='Food'
        isSelected={false}
        onPress={mockOnPress}
      />
    )
    expect(getByText('Food')).toBeTruthy()
  })

  it('calls onPress when pressed', () => {
    const { getByText } = render(
      <CategoryChip
        label='Food'
        isSelected={false}
        onPress={mockOnPress}
      />
    )
    fireEvent.press(getByText('Food'))
    expect(mockOnPress).toHaveBeenCalledTimes(1)
  })

  it('does not call onPress when disabled', () => {
    const { getByText } = render(
      <CategoryChip
        label='Food'
        isSelected={false}
        onPress={mockOnPress}
        disabled
      />
    )
    fireEvent.press(getByText('Food'))
    expect(mockOnPress).not.toHaveBeenCalled()
  })

  it('has correct accessibility state when selected', () => {
    const { getByRole } = render(
      <CategoryChip
        label='Food'
        isSelected={true}
        onPress={mockOnPress}
      />
    )
    const button = getByRole('button')
    expect(button.props.accessibilityState).toEqual({ selected: true, disabled: false })
  })

  it('has correct accessibility state when disabled', () => {
    const { getByRole } = render(
      <CategoryChip
        label='Food'
        isSelected={false}
        onPress={mockOnPress}
        disabled
      />
    )
    const button = getByRole('button')
    expect(button.props.accessibilityState).toEqual({ selected: false, disabled: true })
  })
})
