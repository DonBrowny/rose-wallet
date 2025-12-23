import { CategorySelector } from '@/components/category-selector/category-selector'
import { Button } from '@/components/ui/button/button'
import { Overlay } from '@/components/ui/overlay/overlay'
import { Text } from '@/components/ui/text/text'
import { MAX_CATEGORIES } from '@/constants/categories'
import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { styles } from './edit-quick-categories.style'

interface EditQuickCategoriesProps {
  isVisible: boolean
  onClose: () => void
  onSave: (categories: string[]) => void
  currentCategories: string[]
}

export function EditQuickCategories({ isVisible, onClose, onSave, currentCategories }: EditQuickCategoriesProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentCategories)

  const handleSave = () => {
    if (selectedCategories.length !== MAX_CATEGORIES) return
    onSave(selectedCategories)
    onClose()
  }

  const handleClose = () => {
    setSelectedCategories(currentCategories)
    onClose()
  }

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
          showsVerticalScrollIndicator={false}
        >
          <CategorySelector
            selectedCategories={selectedCategories}
            onSelectionChange={setSelectedCategories}
            availableCategories={currentCategories}
          />
        </ScrollView>

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
