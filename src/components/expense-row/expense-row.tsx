import { Text } from '@/components/ui/text/text'
import type { Expense } from '@/types/expense'
import { getColorForCategory } from '@/utils/color/get-color-for-category'
import { formatDateTime } from '@/utils/date/format-date-time'
import { formatCurrency } from '@/utils/formatter/format-currency'
import React, { memo, useMemo } from 'react'
import { View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './expense-row.styles'

interface ExpenseRowProps {
  expense: Expense
}

export const ExpenseRow = memo(function ExpenseRow({ expense }: ExpenseRowProps) {
  const { theme } = useUnistyles()

  const iconColor = useMemo(() => getColorForCategory(expense.categoryName), [expense.categoryName])

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors[iconColor] }]}>
        <Text style={styles.iconText}>{expense.categoryName.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.content}>
        <Text
          variant='pMdBold'
          numberOfLines={1}
        >
          {expense.merchantName}
        </Text>
        <Text
          variant='pSm'
          color='muted'
          numberOfLines={1}
        >
          {expense.categoryName}
        </Text>
      </View>
      <View style={styles.rightColumn}>
        <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        <Text
          variant='pSm'
          color='muted'
          style={styles.date}
        >
          {formatDateTime(expense.receivedAt)}
        </Text>
      </View>
    </View>
  )
})
