import { CategoryChip } from '@/components/category-chip/category-chip'
import { Input } from '@/components/ui/input/input'
import { Text } from '@/components/ui/text/text'
import { MAX_CATEGORIES, SUGGESTED_CATEGORIES } from '@/constants/categories'
import { setFavoriteCategories } from '@/services/database/categories-repository'
import { Plus } from 'lucide-react-native'
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './onboarding-categories.style'

export interface OnboardingCategoriesRef {
  save: () => Promise<boolean>
}

export const OnboardingCategories = forwardRef<OnboardingCategoriesRef>(function OnboardingCategories(_, ref) {
  const { theme } = useUnistyles()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [customCategory, setCustomCategory] = useState('')
  const [allCategories, setAllCategories] = useState<string[]>(SUGGESTED_CATEGORIES)

  const handleChipPress = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category)
      }
      if (prev.length >= MAX_CATEGORIES) {
        return prev
      }
      return [...prev, category]
    })
  }

  const handleAddCustom = () => {
    const trimmed = customCategory.trim()
    if (!trimmed) return
    if (allCategories.includes(trimmed)) return

    setAllCategories((prev) => [...prev, trimmed])
    if (selectedCategories.length < MAX_CATEGORIES) {
      setSelectedCategories((prev) => [...prev, trimmed])
    }
    setCustomCategory('')
  }

  const save = useCallback(async () => {
    if (selectedCategories.length !== MAX_CATEGORIES) {
      return false
    }
    await setFavoriteCategories(selectedCategories)
    return true
  }, [selectedCategories])

  useImperativeHandle(ref, () => ({ save }), [save])

  return (
    <ScrollView
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
        Select {MAX_CATEGORIES} categories you use most often for quick expense entry
      </Text>

      <Text
        variant='pMdBold'
        color={selectedCategories.length === MAX_CATEGORIES ? 'success' : 'warning'}
        style={styles.counter}
      >
        {selectedCategories.length} of {MAX_CATEGORIES} selected
      </Text>

      <View style={styles.chipsContainer}>
        {allCategories.map((category) => (
          <CategoryChip
            key={category}
            label={category}
            isSelected={selectedCategories.includes(category)}
            onPress={() => handleChipPress(category)}
            disabled={!selectedCategories.includes(category) && selectedCategories.length >= MAX_CATEGORIES}
          />
        ))}
      </View>

      <View style={styles.customInputRow}>
        <Input
          placeholder='Add custom category'
          value={customCategory}
          onChangeText={setCustomCategory}
          containerStyle={styles.customInput}
          onSubmitEditing={handleAddCustom}
        />
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Add custom category'
          onPress={handleAddCustom}
          disabled={!customCategory.trim()}
          style={[styles.addButton, !customCategory.trim() && styles.addButtonDisabled]}
        >
          <Plus
            size={24}
            color={customCategory.trim() ? theme.colors.primary : theme.colors.textMuted}
          />
        </Pressable>
      </View>
    </ScrollView>
  )
})
