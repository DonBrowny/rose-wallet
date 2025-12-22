import { CategoryChip } from '@/components/category-chip/category-chip'
import { Button } from '@/components/ui/button/button'
import { Input } from '@/components/ui/input/input'
import { Overlay } from '@/components/ui/overlay/overlay'
import { Text } from '@/components/ui/text/text'
import { MAX_CATEGORIES, SUGGESTED_CATEGORIES } from '@/constants/categories'
import { Plus } from 'lucide-react-native'
import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './edit-quick-categories.style'

interface EditQuickCategoriesProps {
  isVisible: boolean
  onClose: () => void
  onSave: (categories: string[]) => void
  currentCategories: string[]
}

export function EditQuickCategories({ isVisible, onClose, onSave, currentCategories }: EditQuickCategoriesProps) {
  const { theme } = useUnistyles()
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentCategories)
  const [customCategory, setCustomCategory] = useState('')

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
    if (selectedCategories.includes(trimmed)) return
    if (selectedCategories.length >= MAX_CATEGORIES) return

    setSelectedCategories((prev) => [...prev, trimmed])
    setCustomCategory('')
  }

  const handleSave = () => {
    if (selectedCategories.length !== MAX_CATEGORIES) return
    onSave(selectedCategories)
    onClose()
  }

  const handleClose = () => {
    setSelectedCategories(currentCategories)
    setCustomCategory('')
    onClose()
  }

  const allCategories = [...new Set([...SUGGESTED_CATEGORIES, ...selectedCategories])]

  return (
    <Overlay
      testID='edit-quick-categories'
      isVisible={isVisible}
      onBackdropPress={handleClose}
      overlayStyle={styles.overlay}
    >
      <View style={styles.content}>
        <Text
          variant='h4'
          style={styles.title}
        >
          Quick Categories
        </Text>
        <Text
          variant='pMd'
          color='muted'
          style={styles.subtitle}
        >
          Select exactly {MAX_CATEGORIES} categories for quick access
        </Text>

        <Text
          variant='pSmBold'
          color={selectedCategories.length === MAX_CATEGORIES ? 'success' : 'muted'}
          style={styles.counter}
        >
          {selectedCategories.length} of {MAX_CATEGORIES} selected
        </Text>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.chipsContainer}
          showsVerticalScrollIndicator={false}
        >
          {allCategories.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              isSelected={selectedCategories.includes(category)}
              onPress={() => handleChipPress(category)}
              disabled={!selectedCategories.includes(category) && selectedCategories.length >= MAX_CATEGORIES}
            />
          ))}
        </ScrollView>

        <View style={styles.customInputRow}>
          <Input
            placeholder='Add custom category'
            value={customCategory}
            onChangeText={setCustomCategory}
            containerStyle={styles.customInput}
            onSubmitEditing={handleAddCustom}
          />
          <Button
            size='icon'
            type='outline'
            onPress={handleAddCustom}
            disabled={!customCategory.trim() || selectedCategories.length >= MAX_CATEGORIES}
            leftIcon={
              <Plus
                size={20}
                color={theme.colors.primary}
              />
            }
          />
        </View>

        <View style={styles.buttonRow}>
          <Button
            title='Cancel'
            type='outline'
            onPress={handleClose}
            containerStyle={styles.button}
          />
          <Button
            title='Save'
            onPress={handleSave}
            disabled={selectedCategories.length !== MAX_CATEGORIES}
            containerStyle={styles.button}
          />
        </View>
      </View>
    </Overlay>
  )
}
