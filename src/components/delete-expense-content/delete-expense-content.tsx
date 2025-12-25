import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import { Expense } from '@/types/expense'
import { formatCurrency } from '@/utils/formatter/format-currency'
import React from 'react'
import { View } from 'react-native'
import { styles } from './delete-expense-content.styles'

interface DeleteExpenseContentProps {
  expense: Expense
  onCancel: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export function DeleteExpenseContent({ expense, onCancel, onConfirm, isDeleting }: DeleteExpenseContentProps) {
  return (
    <View style={styles.container}>
      <Text
        variant='h4'
        style={styles.title}
      >
        Delete Expense?
      </Text>
      <Text
        variant='pMd'
        color='muted'
        style={styles.message}
      >
        Are you sure you want to delete this expense of {formatCurrency(expense.amount)} from {expense.merchantName}?
      </Text>
      <View style={styles.buttons}>
        <Button
          title='Cancel'
          type='outline'
          onPress={onCancel}
          disabled={isDeleting}
          containerStyle={styles.button}
        />
        <Button
          title='Delete'
          type='destructive'
          onPress={onConfirm}
          isLoading={isDeleting}
          containerStyle={styles.button}
        />
      </View>
    </View>
  )
}
