import * as categoriesRepository from '@/services/database/categories-repository'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import React, { createRef } from 'react'
import { OnboardingCategories, OnboardingCategoriesRef } from './onboarding-categories'

jest.spyOn(categoriesRepository, 'setFavoriteCategories').mockResolvedValue([])

describe('OnboardingCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the title and subtitle', () => {
    const { getByText } = render(<OnboardingCategories />)

    expect(getByText('Quick Categories')).toBeTruthy()
    expect(getByText(/select exactly 4 categories/i)).toBeTruthy()
  })

  it('renders all suggested categories', () => {
    const { getByText } = render(<OnboardingCategories />)

    expect(getByText('Transportation')).toBeTruthy()
    expect(getByText('Food')).toBeTruthy()
    expect(getByText('Groceries')).toBeTruthy()
    expect(getByText('Utilities')).toBeTruthy()
  })

  it('shows initial selection count as 0', () => {
    const { getByText } = render(<OnboardingCategories />)

    expect(getByText('0 of 4 selected')).toBeTruthy()
  })

  it('updates selection count when category is selected', () => {
    const { getByText } = render(<OnboardingCategories />)

    fireEvent.press(getByText('Food'))
    expect(getByText('1 of 4 selected')).toBeTruthy()

    fireEvent.press(getByText('Transportation'))
    expect(getByText('2 of 4 selected')).toBeTruthy()
  })

  it('allows deselecting a category', () => {
    const { getByText } = render(<OnboardingCategories />)

    fireEvent.press(getByText('Food'))
    expect(getByText('1 of 4 selected')).toBeTruthy()

    fireEvent.press(getByText('Food'))
    expect(getByText('0 of 4 selected')).toBeTruthy()
  })

  it('prevents selecting more than 4 categories', () => {
    const { getByText } = render(<OnboardingCategories />)

    fireEvent.press(getByText('Food'))
    fireEvent.press(getByText('Transportation'))
    fireEvent.press(getByText('Groceries'))
    fireEvent.press(getByText('Utilities'))
    fireEvent.press(getByText('Entertainment'))

    expect(getByText('4 of 4 selected')).toBeTruthy()
  })

  it('allows adding a custom category', () => {
    const { getByText, getByPlaceholderText } = render(<OnboardingCategories />)

    const input = getByPlaceholderText('Add custom category')
    act(() => {
      fireEvent.changeText(input, 'My Custom')
    })
    fireEvent(input, 'submitEditing')

    expect(getByText('My Custom')).toBeTruthy()
    expect(getByText('1 of 4 selected')).toBeTruthy()
  })

  it('does not add duplicate custom category', () => {
    const { getByPlaceholderText, queryAllByText } = render(<OnboardingCategories />)

    const input = getByPlaceholderText('Add custom category')
    act(() => {
      fireEvent.changeText(input, 'Food')
    })
    fireEvent(input, 'submitEditing')

    // Should only have one "Food" chip
    expect(queryAllByText('Food')).toHaveLength(1)
  })

  it('save returns false when less than 4 categories selected', async () => {
    const ref = createRef<OnboardingCategoriesRef>()
    const { getByText } = render(<OnboardingCategories ref={ref} />)

    fireEvent.press(getByText('Food'))
    fireEvent.press(getByText('Transportation'))

    const result = await ref.current?.save()
    expect(result).toBe(false)
    expect(categoriesRepository.setFavoriteCategories).not.toHaveBeenCalled()
  })

  it('save returns true and calls setFavoriteCategories when 4 categories selected', async () => {
    const ref = createRef<OnboardingCategoriesRef>()
    const { getByText } = render(<OnboardingCategories ref={ref} />)

    fireEvent.press(getByText('Food'))
    fireEvent.press(getByText('Transportation'))
    fireEvent.press(getByText('Groceries'))
    fireEvent.press(getByText('Utilities'))

    const result = await ref.current?.save()

    await waitFor(() => {
      expect(result).toBe(true)
      expect(categoriesRepository.setFavoriteCategories).toHaveBeenCalledWith([
        'Food',
        'Transportation',
        'Groceries',
        'Utilities',
      ])
    })
  })

  it('clears input after adding custom category', () => {
    const { getByPlaceholderText } = render(<OnboardingCategories />)

    const input = getByPlaceholderText('Add custom category')
    act(() => {
      fireEvent.changeText(input, 'My Custom')
    })
    fireEvent(input, 'submitEditing')

    expect(input.props.value).toBe('')
  })
})
