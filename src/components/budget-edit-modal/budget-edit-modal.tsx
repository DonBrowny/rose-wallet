import { Button } from '@/components/ui/button/button'
import { Overlay } from '@/components/ui/overlay/overlay'
import { Text } from '@/components/ui/text/text'
import { useBudgetContext } from '@/contexts/budget-context'
import { IndianRupee } from 'lucide-react-native'
import React, { useState } from 'react'
import { View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { Input } from '../ui/input/input'
import { styles } from './budget-edit-modal.style'

interface BudgetEditModalProps {
  isVisible: boolean
  onCancel: () => void
}

export function BudgetEditModal({ isVisible, onCancel }: BudgetEditModalProps) {
  const { theme } = useUnistyles()
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
      testID='budget-edit-modal'
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

        <Input
          testID='budget-input'
          label='Budget Amount'
          placeholder='Enter budget amount'
          value={editBudget}
          onChangeText={setEditBudget}
          keyboardType='decimal-pad'
          leftContent={
            <IndianRupee
              size={16}
              color={theme.colors.primary}
            />
          }
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
