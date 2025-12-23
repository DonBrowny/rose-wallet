import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { ChecklistItem } from './checklist-item'

describe('ChecklistItem', () => {
  const mockOnPress = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('pending status', () => {
    it('renders title and progress', () => {
      const { getByText } = render(
        <ChecklistItem
          title='Review patterns'
          status='pending'
          progress='0/2 reviewed'
          onPress={mockOnPress}
        />
      )

      expect(getByText('Review patterns')).toBeTruthy()
      expect(getByText('0/2 reviewed')).toBeTruthy()
    })

    it('renders Start button', () => {
      const { getByText } = render(
        <ChecklistItem
          title='Review patterns'
          status='pending'
          onPress={mockOnPress}
        />
      )

      expect(getByText('Start')).toBeTruthy()
    })

    it('calls onPress when button is pressed', () => {
      const { getByText } = render(
        <ChecklistItem
          title='Review patterns'
          status='pending'
          onPress={mockOnPress}
        />
      )

      fireEvent.press(getByText('Start'))
      expect(mockOnPress).toHaveBeenCalledTimes(1)
    })
  })

  describe('completed status', () => {
    it('renders Done button', () => {
      const { getByText } = render(
        <ChecklistItem
          title='Review patterns'
          status='completed'
          onPress={mockOnPress}
        />
      )

      expect(getByText('Done')).toBeTruthy()
    })

    it('does not render progress when completed', () => {
      const { queryByText } = render(
        <ChecklistItem
          title='Review patterns'
          status='completed'
          progress='2/2 reviewed'
          onPress={mockOnPress}
        />
      )

      expect(queryByText('2/2 reviewed')).toBeNull()
    })
  })

  describe('locked status', () => {
    it('renders Locked button', () => {
      const { getByText } = render(
        <ChecklistItem
          title='Add expenses'
          status='locked'
          progress='Complete patterns first'
          onPress={mockOnPress}
        />
      )

      expect(getByText('Locked')).toBeTruthy()
    })

    it('renders progress text when locked', () => {
      const { getByText } = render(
        <ChecklistItem
          title='Add expenses'
          status='locked'
          progress='Complete patterns first'
          onPress={mockOnPress}
        />
      )

      expect(getByText('Complete patterns first')).toBeTruthy()
    })
  })
})
