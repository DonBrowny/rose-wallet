import { Text } from '@/components/ui/text/text'
import { useRouter } from 'expo-router'
import { ArrowRight, Edit3 } from 'lucide-react-native'
import React, { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { BudgetEditModal } from '../../budget-edit-modal/budget-edit-modal'
import { useStyles } from './budget-info-rows.style'

interface BudgetInfoRowsProps {
  spentFormatted: string
  budgetFormatted: string
  isOverBudget: boolean
}

export function BudgetInfoRows({ spentFormatted, budgetFormatted, isOverBudget }: BudgetInfoRowsProps) {
  const styles = useStyles()
  const { theme } = useUnistyles()
  const router = useRouter()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleEditPress = () => {
    setIsModalVisible(true)
  }

  const handleExpensePress = () => {
    router.push('/analytics')
  }

  const handleCancelEdit = () => {
    setIsModalVisible(false)
  }

  return (
    <View style={styles.rightSection}>
      <TouchableOpacity
        style={styles.infoRow}
        onPress={handleExpensePress}
      >
        <Text variant='pSm'>Monthly Expense</Text>
        <View style={styles.valueRow}>
          <Text
            variant='aLg'
            color={isOverBudget ? 'error' : 'default'}
          >
            {spentFormatted}
          </Text>
          <ArrowRight
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
          <Edit3
            size={20}
            color={theme.colors.grey4}
          />
        </View>
      </TouchableOpacity>

      <BudgetEditModal
        isVisible={isModalVisible}
        onCancel={handleCancelEdit}
      />
    </View>
  )
}
