import { CategoryChip } from '@/components/category-chip/category-chip'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
import { Category } from '@/db/schema'
import { Pencil } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './quick-category-chips.style'

interface QuickCategoryChipsProps {
  categories: Category[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
  onEditPress: () => void
  isLoading?: boolean
}

export function QuickCategoryChips({
  categories,
  selectedCategory,
  onSelectCategory,
  onEditPress,
  isLoading = false,
}: QuickCategoryChipsProps) {
  const { theme } = useUnistyles()

  if (isLoading) {
    return null
  }

  // Use default categories if user hasn't set any favorites
  const displayCategories =
    categories.length > 0 ? categories : DEFAULT_CATEGORIES.map((name, index) => ({ id: -index - 1, name }) as Category)

  return (
    <View style={styles.container}>
      <View style={styles.chipsRow}>
        {displayCategories.map((category) => (
          <CategoryChip
            key={category.id}
            label={category.name}
            isSelected={selectedCategory === category.name}
            onPress={() => onSelectCategory(category.name)}
          />
        ))}
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Edit quick categories'
          onPress={onEditPress}
          style={styles.editButton}
        >
          <Pencil
            size={18}
            color={theme.colors.textMuted}
          />
        </Pressable>
      </View>
    </View>
  )
}
