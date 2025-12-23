import { CategorySelector } from '@/components/category-selector/category-selector'
import { Text } from '@/components/ui/text/text'
import { MAX_CATEGORIES, SUGGESTED_CATEGORIES } from '@/constants/categories'
import { setFavoriteCategories } from '@/services/database/categories-repository'
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { ToastAndroid } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { styles } from './onboarding-categories.style'

export interface OnboardingCategoriesRef {
  save: () => Promise<boolean>
}

interface OnboardingCategoriesProps {
  existingFavorites?: string[]
}

export const OnboardingCategories = forwardRef<OnboardingCategoriesRef, OnboardingCategoriesProps>(
  function OnboardingCategories({ existingFavorites }, ref) {
    const hasExistingFavorites = existingFavorites && existingFavorites.length > 0
    const availableCategories = hasExistingFavorites ? existingFavorites : SUGGESTED_CATEGORIES
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
      hasExistingFavorites ? existingFavorites : []
    )

    const save = useCallback(async () => {
      if (selectedCategories.length !== MAX_CATEGORIES) {
        ToastAndroid.show(`Please select ${MAX_CATEGORIES} categories to continue`, ToastAndroid.SHORT)
        return false
      }
      await setFavoriteCategories(selectedCategories)
      return true
    }, [selectedCategories])

    useImperativeHandle(ref, () => ({ save }), [save])

    return (
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text
          variant='h3'
          color='primary'
        >
          Quick Categories
        </Text>
        <Text
          variant='pMd'
          color='muted'
          style={styles.subtitle}
        >
          You must select exactly {MAX_CATEGORIES} categories for quick expense entry to continue
        </Text>

        <Text
          variant='pMdBold'
          color={selectedCategories.length === MAX_CATEGORIES ? 'success' : 'warning'}
          style={styles.counter}
        >
          {selectedCategories.length} of {MAX_CATEGORIES} selected
        </Text>

        <CategorySelector
          selectedCategories={selectedCategories}
          onSelectionChange={setSelectedCategories}
          availableCategories={availableCategories}
        />
      </KeyboardAwareScrollView>
    )
  }
)
