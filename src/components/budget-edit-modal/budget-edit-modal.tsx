import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import { useBudgetContext } from '@/contexts/budget-context'
import { Overlay, useTheme } from '@rneui/themed'
import React, { useState } from 'react'
import { View } from 'react-native'
import { ThemedInput } from '../ui/input'
import { useStyles } from './budget-edit-modal.style'

interface BudgetEditModalProps {
  isVisible: boolean
  onCancel: () => void
}

export function BudgetEditModal({ isVisible, onCancel }: BudgetEditModalProps) {
  const styles = useStyles()
  const { theme } = useTheme()
  const { monthlyBudget, budgetChangeHandler } = useBudgetContext()
  const [editBudget, setEditBudget] = useState(monthlyBudget.toString())

  const handleSave = () => {
    const newBudget = parseFloat(editBudget)
    if (!isNaN(newBudget) && newBudget > 0) {
      budgetChangeHandler(newBudget)
      onCancel()
    }
  }

  const handleCancel = () => {
    setEditBudget(monthlyBudget.toString())
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
