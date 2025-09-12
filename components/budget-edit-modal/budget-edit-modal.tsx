import { Text } from '@/components/ui/text'
import { Button, Overlay, useTheme } from '@rneui/themed'
import React, { useState } from 'react'
import { View } from 'react-native'
import { ThemedInput } from '../ui/input'
import { useStyles } from './budget-edit-modal.style'

interface BudgetEditModalProps {
  isVisible: boolean
  currentBudget: number
  onSave: (newBudget: number) => void
  onCancel: () => void
}

export function BudgetEditModal({ isVisible, currentBudget, onSave, onCancel }: BudgetEditModalProps) {
  const styles = useStyles()
  const { theme } = useTheme()
  const [editBudget, setEditBudget] = useState(currentBudget.toString())

  const handleSave = () => {
    const newBudget = parseFloat(editBudget)
    if (!isNaN(newBudget) && newBudget > 0) {
      setEditBudget(newBudget.toString())
      onSave(newBudget)
    }
  }

  const handleCancel = () => {
    setEditBudget(currentBudget.toString())
    onCancel()
  }

  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={handleCancel}
      overlayStyle={styles.overlay}
    >
      <View style={styles.overlayContent}>
        <Text
          variant='h4'
          style={styles.overlayTitle}
        >
          Edit Monthly Budget
        </Text>

        <ThemedInput
          label='Budget Amount'
          placeholder='Enter budget amount'
          value={editBudget}
          onChangeText={setEditBudget}
          keyboardType='numeric'
          leftIcon={{ type: 'material', name: 'currency-rupee', color: theme.colors.primary }}
        />

        <View style={styles.overlayButtons}>
          <Button
            title='Cancel'
            type='outline'
            onPress={handleCancel}
          />
          <Button
            title='Save Budget'
            onPress={handleSave}
          />
        </View>
      </View>
    </Overlay>
  )
}
