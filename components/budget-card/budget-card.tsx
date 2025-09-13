import { Text } from '@/components/ui/text'
import { calculateBudgetData } from '@/utils/formatter/calculate-budget-data'
import { Card, Icon, useTheme } from '@rneui/themed'
import React, { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { BudgetEditModal } from '../budget-edit-modal/budget-edit-modal'
import { useStyles } from './budget-card.style'

export function BudgetCard() {
  const styles = useStyles()
  const { theme } = useTheme()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [budget, setBudget] = useState(5000)
  const [totalExpense] = useState(62000000)

  // Calculate all budget data using utility function
  const budgetData = calculateBudgetData(budget, totalExpense)

  const handleEditPress = () => {
    setIsModalVisible(true)
  }

  const handleSaveBudget = (newBudget: number) => {
    setBudget(newBudget)
    setIsModalVisible(false)
  }

  const handleCancelEdit = () => {
    setIsModalVisible(false)
  }

  return (
    <Card>
      <View style={styles.header}>
        <Text variant='h4'>Budget Overview</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditPress}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.expenseCard]}>
          <View style={styles.statHeader}>
            <View style={[styles.statIcon, { backgroundColor: theme.colors.error }]}>
              <Icon
                name='trending-down'
                type='material'
                size={16}
                color={theme.colors.white}
              />
            </View>
            <Text variant='pMd'>SPENT</Text>
          </View>
          <Text
            variant='pLgBold'
            style={[budgetData.isOverBudget && styles.overBudgetText]}
          >
            {budgetData.spentFormatted}
          </Text>
        </View>

        <View style={[styles.statCard, styles.budgetCard]}>
          <View style={styles.statHeader}>
            <View style={[styles.statIcon, { backgroundColor: theme.colors.success }]}>
              <Icon
                name='account-balance-wallet'
                type='material'
                size={16}
                color={theme.colors.white}
              />
            </View>
            <Text variant='pMd'>BUDGET</Text>
          </View>
          <View style={styles.budgetRow}>
            <Text variant='pLgBold'>{budgetData.budgetFormatted}</Text>
            <Text style={styles.statSubtext}> / Month</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text variant='pMdBold'>Budget Progress</Text>
          <Text
            variant='pMd'
            style={styles.progressPercentage}
          >
            {budgetData.budgetUsedPercentage}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(budgetData.budgetUsed, 100)}%`,
                backgroundColor: budgetData.isOverBudget
                  ? theme.colors.error
                  : budgetData.budgetUsed > 80
                    ? theme.colors.warning
                    : theme.colors.success,
              },
            ]}
          />
        </View>
      </View>
      <View>
        <Text
          variant='pMdBold'
          style={styles.dailyAllowanceLabel}
        >
          Daily allowance:{' '}
          <Text
            variant='pLgBold'
            style={[budgetData.isOverBudget ? styles.overBudgetText : styles.underBudgetText]}
          >
            {budgetData.dailyAllowanceFormatted}
          </Text>{' '}
          ({budgetData.remainingDays} day{budgetData.remainingDays !== 1 ? 's' : ''} left)
        </Text>
      </View>

      <BudgetEditModal
        isVisible={isModalVisible}
        currentBudget={budget}
        onSave={handleSaveBudget}
        onCancel={handleCancelEdit}
      />
    </Card>
  )
}
