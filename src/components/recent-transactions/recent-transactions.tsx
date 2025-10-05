import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import { useTheme } from '@rneui/themed'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Eye, Plus } from 'lucide-react-native'
import React from 'react'
import { View } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'
import { useStyles } from './recent-transactions.styles'

interface RecentTransactionsProps {
  transactions?: any[] // Will be typed properly when we have transaction data
}

export function RecentTransactions({ transactions = [] }: RecentTransactionsProps) {
  const styles = useStyles()
  const { theme } = useTheme()
  const router = useRouter()
  const [isPatternDiscoveryCompleted] = useMMKVBoolean(MMKV_KEYS.PATTERNS.IS_PATTERN_DISCOVERY_COMPLETED)

  const hasTransactions = transactions && transactions.length > 0

  const handleAddExpense = () => {
    router.push('/(shared)/add-expense')
  }

  const handleReviewPatterns = () => {
    router.push('/(shared)/patterns')
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
                  color={theme.colors.white}
                />
              ) : (
                <Eye
                  size={20}
                  color={theme.colors.white}
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
