import { Text } from '@/components/ui/text'
import { Icon, useTheme } from '@rneui/themed'
import React, { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { BudgetEditModal } from '../../budget-edit-modal/budget-edit-modal'
import { useStyles } from './budget-info-rows.style'

interface BudgetInfoRowsProps {
  spentFormatted: string
  budgetFormatted: string
  isOverBudget: boolean
  currentBudget: number
  onBudgetChange: (newBudget: number) => void
}

export function BudgetInfoRows({
  spentFormatted,
  budgetFormatted,
  isOverBudget,
  currentBudget,
  onBudgetChange,
}: BudgetInfoRowsProps) {
  const styles = useStyles()
  const { theme } = useTheme()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleEditPress = () => {
    setIsModalVisible(true)
  }

  const handleSaveBudget = (newBudget: number) => {
    onBudgetChange(newBudget)
    setIsModalVisible(false)
  }

  const handleCancelEdit = () => {
    setIsModalVisible(false)
  }

  return (
    <View style={styles.rightSection}>
      <TouchableOpacity style={styles.infoRow}>
        <Text variant='pSm'>Monthly Expense</Text>
        <View style={styles.valueRow}>
          <Text
            variant='aLg'
            style={isOverBudget && styles.overBudgetText}
          >
            {spentFormatted}
          </Text>
          <Icon
            name='arrow-forward'
            type='ionicon'
            size={24}
            color={theme.colors.grey4}
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.infoRow}
        onPress={handleEditPress}
      >
        <Text variant='pSm'>Monthly Budget</Text>
        <View style={styles.valueRow}>
          <Text variant='aLg'>{budgetFormatted}</Text>
          <Icon
            name='edit'
            type='material'
            size={20}
            color={theme.colors.grey4}
          />
        </View>
      </TouchableOpacity>

      <BudgetEditModal
        isVisible={isModalVisible}
        currentBudget={currentBudget}
        onSave={handleSaveBudget}
        onCancel={handleCancelEdit}
      />
    </View>
  )
}
