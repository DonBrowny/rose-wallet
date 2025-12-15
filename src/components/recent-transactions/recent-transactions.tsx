import { ExpenseRow } from '@/components/expense-row/expense-row'
import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import type { Expense } from '@/types/expense'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Eye, Plus } from 'lucide-react-native'
import React, { useCallback } from 'react'
import { View } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './recent-transactions.styles'

interface RecentTransactionsProps {
  expenses?: Expense[]
  isLoading?: boolean
}

export function RecentTransactions({ expenses = [], isLoading = false }: RecentTransactionsProps) {
  const { theme } = useUnistyles()
  const router = useRouter()
  const [isPatternDiscoveryCompleted] = useMMKVBoolean(MMKV_KEYS.PATTERNS.IS_PATTERN_DISCOVERY_COMPLETED)

  const hasExpenses = expenses && expenses.length > 0

  const handleAddExpense = () => {
    router.push('/(shared)/add-expense')
  }

  const handleReviewPatterns = () => {
    router.push('/(shared)/patterns')
  }

  const renderItem = useCallback(({ item }: { item: Expense }) => <ExpenseRow expense={item} />, [])

  const keyExtractor = useCallback((item: Expense) => item.id.toString(), [])

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text variant='h4'>Recent Expenses</Text>
        <View style={styles.loadingContainer}>
          <Text
            variant='pSm'
            color='muted'
          >
            Loading expenses...
          </Text>
        </View>
      </View>
    )
  }

  if (!hasExpenses) {
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
            color='muted'
            style={styles.emptyDescription}
          >
            Plant your first expense to start your money garden
          </Text>
          <Button
            title={isPatternDiscoveryCompleted ? 'Add Expense' : 'Review Patterns'}
            onPress={isPatternDiscoveryCompleted ? handleAddExpense : handleReviewPatterns}
            containerStyle={styles.addButton}
            leftIcon={
              isPatternDiscoveryCompleted ? (
                <Plus
                  size={20}
                  color={theme.colors.surface}
                />
              ) : (
                <Eye
                  size={20}
                  color={theme.colors.surface}
                />
              )
            }
          />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text variant='h4'>Recent Expenses</Text>
      <View style={styles.listContainer}>
        <FlashList
          data={expenses}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  )
}
