import { Text } from '@/components/ui/text'
import { Button, useTheme } from '@rneui/themed'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Plus } from 'lucide-react-native'
import React from 'react'
import { View } from 'react-native'
import { useStyles } from './recent-transactions.styles'

interface RecentTransactionsProps {
  transactions?: any[] // Will be typed properly when we have transaction data
}

export function RecentTransactions({ transactions = [] }: RecentTransactionsProps) {
  const styles = useStyles()
  const { theme } = useTheme()
  const router = useRouter()

  const hasTransactions = transactions && transactions.length > 0

  const handleAddExpense = () => {
    router.push('/patterns')
  }

  if (!hasTransactions) {
    return (
      <View style={styles.container}>
        <Text variant='h4'>Recent Expenses</Text>
        <View style={styles.emptyStateContainer}>
          <Image
            source={require('@/assets/images/empty.png')}
            style={styles.emptyImage}
            contentFit='contain'
            transition={300}
          />
          <Text
            variant='h3'
            style={styles.emptyTitle}
          >
            No Transactions Yet
          </Text>
          <Text
            variant='pSm'
            style={styles.emptyDescription}
          >
            Plant your first expense to start your money garden
          </Text>
          <Button
            title='Add Expense'
            onPress={handleAddExpense}
            buttonStyle={styles.addButton}
            titleStyle={styles.addButtonText}
            icon={
              <Plus
                size={20}
                color={theme.colors.white}
              />
            }
            iconPosition='left'
            iconContainerStyle={styles.iconContainer}
          />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text
        variant='h2'
        style={styles.sectionTitle}
      >
        Recent Expenses
      </Text>
      {/* TODO: Add transaction list when we have transaction data */}
      <View style={styles.placeholderContainer}>
        <Text
          variant='pSm'
          style={styles.placeholderText}
        >
          Transaction list will be implemented here
        </Text>
      </View>
    </View>
  )
}
