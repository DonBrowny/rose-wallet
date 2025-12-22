import { DEFAULT_CATEGORIES } from '@/constants/categories'
import { Category } from '@/db/schema'
import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { QuickCategoryChips } from './quick-category-chips'

describe('QuickCategoryChips', () => {
  const mockOnSelectCategory = jest.fn()
  const mockOnEditPress = jest.fn()

  const mockCategories: Category[] = [
    { id: 1, name: 'Food', parentId: null, isFavorite: true },
    { id: 2, name: 'Transport', parentId: null, isFavorite: true },
    { id: 3, name: 'Utilities', parentId: null, isFavorite: true },
    { id: 4, name: 'Entertainment', parentId: null, isFavorite: true },
  ]

  beforeEach(() => {
    mockOnSelectCategory.mockClear()
    mockOnEditPress.mockClear()
  })

  it('renders all category chips', () => {
    const { getByText } = render(
      <QuickCategoryChips
        categories={mockCategories}
        selectedCategory=''
        onSelectCategory={mockOnSelectCategory}
        onEditPress={mockOnEditPress}
      />
    )

    expect(getByText('Food')).toBeTruthy()
    expect(getByText('Transport')).toBeTruthy()
    expect(getByText('Utilities')).toBeTruthy()
    expect(getByText('Entertainment')).toBeTruthy()
  })

  it('calls onSelectCategory when a chip is pressed', () => {
    const { getByText } = render(
      <QuickCategoryChips
        categories={mockCategories}
        selectedCategory=''
        onSelectCategory={mockOnSelectCategory}
        onEditPress={mockOnEditPress}
      />
    )

    fireEvent.press(getByText('Food'))
    expect(mockOnSelectCategory).toHaveBeenCalledWith('Food')
  })

  it('calls onEditPress when edit button is pressed', () => {
    const { getByLabelText } = render(
      <QuickCategoryChips
        categories={mockCategories}
        selectedCategory=''
        onSelectCategory={mockOnSelectCategory}
        onEditPress={mockOnEditPress}
      />
    )

    fireEvent.press(getByLabelText('Edit quick categories'))
    expect(mockOnEditPress).toHaveBeenCalledTimes(1)
  })

  it('returns null when loading', () => {
    const { queryByText } = render(
      <QuickCategoryChips
        categories={mockCategories}
        selectedCategory=''
        onSelectCategory={mockOnSelectCategory}
        onEditPress={mockOnEditPress}
        isLoading
      />
    )

    expect(queryByText('Food')).toBeNull()
  })

  it('shows default categories when categories array is empty', () => {
    const { getByText } = render(
      <QuickCategoryChips
        categories={[]}
        selectedCategory=''
        onSelectCategory={mockOnSelectCategory}
        onEditPress={mockOnEditPress}
      />
    )

    DEFAULT_CATEGORIES.forEach((category) => {
      expect(getByText(category)).toBeTruthy()
    })
  })

  it('selects category matching selectedCategory prop', () => {
    const { getByText } = render(
      <QuickCategoryChips
        categories={mockCategories}
        selectedCategory='Food'
        onSelectCategory={mockOnSelectCategory}
        onEditPress={mockOnEditPress}
      />
    )

    const foodChip = getByText('Food')
    expect(foodChip).toBeTruthy()
  })
})
