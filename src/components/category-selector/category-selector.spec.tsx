import { MAX_CATEGORIES } from '@/constants/categories'
import { act, fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { CategorySelector } from './category-selector'

describe('CategorySelector', () => {
  const mockOnSelectionChange = jest.fn()
  const availableCategories = ['Food', 'Transportation', 'Groceries', 'Utilities', 'Entertainment']

  beforeEach(() => {
    mockOnSelectionChange.mockClear()
  })

  it('renders all available categories as chips', () => {
    const { getByText } = render(
      <CategorySelector
        selectedCategories={[]}
        onSelectionChange={mockOnSelectionChange}
        availableCategories={availableCategories}
      />
    )

    availableCategories.forEach((category) => {
      expect(getByText(category)).toBeTruthy()
    })
  })

  it('calls onSelectionChange when selecting a category', () => {
    const { getByText } = render(
      <CategorySelector
        selectedCategories={[]}
        onSelectionChange={mockOnSelectionChange}
        availableCategories={availableCategories}
      />
    )

    fireEvent.press(getByText('Food'))
    expect(mockOnSelectionChange).toHaveBeenCalledWith(['Food'])
  })

  it('calls onSelectionChange when deselecting a category', () => {
    const { getByText } = render(
      <CategorySelector
        selectedCategories={['Food', 'Transportation']}
        onSelectionChange={mockOnSelectionChange}
        availableCategories={availableCategories}
      />
    )

    fireEvent.press(getByText('Food'))
    expect(mockOnSelectionChange).toHaveBeenCalledWith(['Transportation'])
  })

  it('does not allow selecting more than MAX_CATEGORIES', () => {
    const selectedCategories = ['Food', 'Transportation', 'Groceries', 'Utilities']
    const { getByText } = render(
      <CategorySelector
        selectedCategories={selectedCategories}
        onSelectionChange={mockOnSelectionChange}
        availableCategories={availableCategories}
      />
    )

    fireEvent.press(getByText('Entertainment'))
    expect(mockOnSelectionChange).not.toHaveBeenCalled()
  })

  it('allows adding a custom category via input', () => {
    const { getByText, getByPlaceholderText } = render(
      <CategorySelector
        selectedCategories={[]}
        onSelectionChange={mockOnSelectionChange}
        availableCategories={availableCategories}
      />
    )

    const input = getByPlaceholderText('Add custom category')
    act(() => {
      fireEvent.changeText(input, 'Custom Category')
    })
    fireEvent(input, 'submitEditing')

    expect(getByText('Custom Category')).toBeTruthy()
    expect(mockOnSelectionChange).toHaveBeenCalledWith(['Custom Category'])
  })

  it('auto-selects custom category when under MAX_CATEGORIES', () => {
    const { getByPlaceholderText } = render(
      <CategorySelector
        selectedCategories={['Food']}
        onSelectionChange={mockOnSelectionChange}
        availableCategories={availableCategories}
      />
    )

    const input = getByPlaceholderText('Add custom category')
    act(() => {
      fireEvent.changeText(input, 'New Category')
    })
    fireEvent(input, 'submitEditing')

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['Food', 'New Category'])
  })

  it('does not auto-select custom category when at MAX_CATEGORIES', () => {
    const selectedCategories = ['Food', 'Transportation', 'Groceries', 'Utilities']
    const { getByText, getByPlaceholderText } = render(
      <CategorySelector
        selectedCategories={selectedCategories}
        onSelectionChange={mockOnSelectionChange}
        availableCategories={availableCategories}
      />
    )

    const input = getByPlaceholderText('Add custom category')
    act(() => {
      fireEvent.changeText(input, 'New Category')
    })
    fireEvent(input, 'submitEditing')

    // Category should be added to the list but not selected
    expect(getByText('New Category')).toBeTruthy()
    expect(mockOnSelectionChange).not.toHaveBeenCalled()
  })

  it('does not add duplicate custom category', () => {
    const { getByPlaceholderText } = render(
      <CategorySelector
        selectedCategories={[]}
        onSelectionChange={mockOnSelectionChange}
        availableCategories={availableCategories}
      />
    )

    const input = getByPlaceholderText('Add custom category')
    act(() => {
      fireEvent.changeText(input, 'Food')
    })
    fireEvent(input, 'submitEditing')

    expect(mockOnSelectionChange).not.toHaveBeenCalled()
  })

  it('trims whitespace from custom category', () => {
    const { getByText, getByPlaceholderText } = render(
      <CategorySelector
        selectedCategories={[]}
        onSelectionChange={mockOnSelectionChange}
        availableCategories={availableCategories}
      />
    )

    const input = getByPlaceholderText('Add custom category')
    act(() => {
      fireEvent.changeText(input, '  Trimmed Category  ')
    })
    fireEvent(input, 'submitEditing')

    expect(getByText('Trimmed Category')).toBeTruthy()
    expect(mockOnSelectionChange).toHaveBeenCalledWith(['Trimmed Category'])
  })

  it('does not add empty custom category', () => {
    const { getByPlaceholderText } = render(
      <CategorySelector
        selectedCategories={[]}
        onSelectionChange={mockOnSelectionChange}
        availableCategories={availableCategories}
      />
    )

    const input = getByPlaceholderText('Add custom category')
    act(() => {
      fireEvent.changeText(input, '   ')
    })
    fireEvent(input, 'submitEditing')

    expect(mockOnSelectionChange).not.toHaveBeenCalled()
  })

  it('clears input after adding custom category', () => {
    const { getByPlaceholderText } = render(
      <CategorySelector
        selectedCategories={[]}
        onSelectionChange={mockOnSelectionChange}
        availableCategories={availableCategories}
      />
    )

    const input = getByPlaceholderText('Add custom category')
    act(() => {
      fireEvent.changeText(input, 'New Category')
    })
    fireEvent(input, 'submitEditing')

    expect(input.props.value).toBe('')
  })

  it('allows adding custom category via add button press', () => {
    const { getByText, getByPlaceholderText, getByLabelText } = render(
      <CategorySelector
        selectedCategories={[]}
        onSelectionChange={mockOnSelectionChange}
        availableCategories={availableCategories}
      />
    )

    const input = getByPlaceholderText('Add custom category')
    act(() => {
      fireEvent.changeText(input, 'Button Added')
    })
    fireEvent.press(getByLabelText('Add custom category'))

    expect(getByText('Button Added')).toBeTruthy()
    expect(mockOnSelectionChange).toHaveBeenCalledWith(['Button Added'])
  })
})
