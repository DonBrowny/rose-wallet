import { MAX_CATEGORIES } from '@/constants/categories'
import { act, fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { EditQuickCategories } from './edit-quick-categories'

describe('EditQuickCategories', () => {
  const mockOnClose = jest.fn()
  const mockOnSave = jest.fn()
  const defaultCategories = ['Food', 'Transportation', 'Groceries', 'Utilities']

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnSave.mockClear()
  })

  it('renders when visible', () => {
    const { getByTestId } = render(
      <EditQuickCategories
        isVisible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentCategories={defaultCategories}
      />
    )

    expect(getByTestId('edit-quick-categories')).toBeTruthy()
  })

  it('renders current categories as chips', () => {
    const { getByText } = render(
      <EditQuickCategories
        isVisible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentCategories={defaultCategories}
      />
    )

    defaultCategories.forEach((category) => {
      expect(getByText(category)).toBeTruthy()
    })
  })

  it('shows current categories as selected', () => {
    const currentCategories = ['Food', 'Transportation']
    const { getByText } = render(
      <EditQuickCategories
        isVisible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentCategories={currentCategories}
      />
    )

    expect(getByText(`${currentCategories.length} of ${MAX_CATEGORIES} selected`)).toBeTruthy()
  })

  it('allows selecting a category', () => {
    const currentCategories = ['Food', 'Transportation']
    const { getByText } = render(
      <EditQuickCategories
        isVisible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentCategories={currentCategories}
      />
    )

    // Deselect one first to have room to select
    fireEvent.press(getByText('Food'))
    expect(getByText(`1 of ${MAX_CATEGORIES} selected`)).toBeTruthy()

    // Select it back
    fireEvent.press(getByText('Food'))
    expect(getByText(`2 of ${MAX_CATEGORIES} selected`)).toBeTruthy()
  })

  it('allows deselecting a category', () => {
    const { getByText } = render(
      <EditQuickCategories
        isVisible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentCategories={['Food']}
      />
    )

    fireEvent.press(getByText('Food'))
    expect(getByText(`0 of ${MAX_CATEGORIES} selected`)).toBeTruthy()
  })

  it('prevents selecting more than MAX_CATEGORIES', () => {
    const currentCategories = ['Food', 'Transportation', 'Groceries', 'Utilities']
    const { getByText, getByPlaceholderText } = render(
      <EditQuickCategories
        isVisible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentCategories={currentCategories}
      />
    )

    // All 4 are already selected
    expect(getByText(`4 of ${MAX_CATEGORIES} selected`)).toBeTruthy()

    // Try to add a custom category - it should be added but NOT auto-selected
    const input = getByPlaceholderText('Add custom category')
    act(() => {
      fireEvent.changeText(input, 'Entertainment')
    })
    fireEvent(input, 'submitEditing')

    // Should still be 4 selected (new category added but not selected)
    expect(getByText('Entertainment')).toBeTruthy()
    expect(getByText(`4 of ${MAX_CATEGORIES} selected`)).toBeTruthy()
  })

  it('calls onSave with selected categories when Save is pressed', () => {
    const currentCategories = ['Food', 'Transportation', 'Groceries', 'Utilities']
    const { getByText } = render(
      <EditQuickCategories
        isVisible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentCategories={currentCategories}
      />
    )

    fireEvent.press(getByText('Save'))
    expect(mockOnSave).toHaveBeenCalledWith(currentCategories)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('does not call onSave when less than MAX_CATEGORIES selected', () => {
    const { getByText } = render(
      <EditQuickCategories
        isVisible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentCategories={['Food']}
      />
    )

    fireEvent.press(getByText('Save'))
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('calls onClose when Cancel is pressed', () => {
    const { getByText } = render(
      <EditQuickCategories
        isVisible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentCategories={['Food', 'Transportation']}
      />
    )

    fireEvent.press(getByText('Cancel'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('allows adding a custom category', () => {
    const { getByText, getByPlaceholderText } = render(
      <EditQuickCategories
        isVisible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentCategories={[]}
      />
    )

    const input = getByPlaceholderText('Add custom category')
    act(() => {
      fireEvent.changeText(input, 'Custom Category')
    })
    fireEvent(input, 'submitEditing')

    expect(getByText('Custom Category')).toBeTruthy()
    expect(getByText(`1 of ${MAX_CATEGORIES} selected`)).toBeTruthy()
  })

  it('does not add duplicate custom category', () => {
    const { getByText, getByPlaceholderText } = render(
      <EditQuickCategories
        isVisible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentCategories={['Food']}
      />
    )

    const input = getByPlaceholderText('Add custom category')
    act(() => {
      fireEvent.changeText(input, 'Food')
    })
    fireEvent(input, 'submitEditing')

    // Should still only have 1 selected
    expect(getByText(`1 of ${MAX_CATEGORIES} selected`)).toBeTruthy()
  })
})
