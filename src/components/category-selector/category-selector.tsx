import { CategoryChip } from '@/components/category-chip/category-chip'
import { Input } from '@/components/ui/input/input'
import { MAX_CATEGORIES } from '@/constants/categories'
import { Plus } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './category-selector.style'

interface CategorySelectorProps {
  selectedCategories: string[]
  onSelectionChange: (categories: string[]) => void
  availableCategories: string[]
}

export function CategorySelector({
  selectedCategories,
  onSelectionChange,
  availableCategories,
}: CategorySelectorProps) {
  const { theme } = useUnistyles()
  const [customCategory, setCustomCategory] = useState('')
  const [categories, setCategories] = useState<string[]>(availableCategories)

  const trimmedCustomCategory = customCategory.trim()
  const hasCustomCategory = trimmedCustomCategory.length > 0

  const handleChipPress = (category: string) => {
    if (selectedCategories.includes(category)) {
      onSelectionChange(selectedCategories.filter((c) => c !== category))
    } else if (selectedCategories.length < MAX_CATEGORIES) {
      onSelectionChange([...selectedCategories, category])
    }
  }

  const handleAddCustom = () => {
    if (!hasCustomCategory) return
    if (categories.includes(trimmedCustomCategory)) return

    setCategories((prev) => [...prev, trimmedCustomCategory])
    if (selectedCategories.length < MAX_CATEGORIES) {
      onSelectionChange([...selectedCategories, trimmedCustomCategory])
    }
    setCustomCategory('')
  }

  return (
    <View style={styles.container}>
      <View style={styles.chipsContainer}>
        {categories.map((category) => (
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
          returnKeyType='done'
        />
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Add custom category'
          onPress={handleAddCustom}
          disabled={!hasCustomCategory}
          style={[styles.addButton, !hasCustomCategory && styles.addButtonDisabled]}
        >
          <Plus
            size={24}
            color={hasCustomCategory ? theme.colors.primary : theme.colors.textMuted}
          />
        </Pressable>
      </View>
    </View>
  )
}
