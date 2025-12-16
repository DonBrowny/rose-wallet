import { ExpenseRow } from '@/components/expense-row/expense-row'
import { Text } from '@/components/ui/text/text'
import { useGetRecentExpenses } from '@/hooks/use-get-recent-expenses'
import { GroupedExpenseItem, groupExpensesByDate } from '@/utils/expense/group-expenses-by-date'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { useCallback, useMemo } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { styles } from './expense-history-screen.styles'

const EXPENSE_HISTORY_LIMIT = 100

export function ExpenseHistoryScreen() {
  const { data: expenses = [], isLoading } = useGetRecentExpenses(EXPENSE_HISTORY_LIMIT)

  const groupedItems = useMemo(() => groupExpensesByDate(expenses), [expenses])

  const renderItem = useCallback(({ item }: { item: GroupedExpenseItem }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text
            variant='pSmBold'
            color='muted'
          >
            {item.date}
          </Text>
        </View>
      )
    }
    return <ExpenseRow expense={item.expense} />
  }, [])

  const keyExtractor = useCallback((item: GroupedExpenseItem) => {
    if (item.type === 'header') {
      return `header-${item.date}`
    }
    return `expense-${item.expense.id}`
  }, [])

  const getItemType = useCallback((item: GroupedExpenseItem) => item.type, [])

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size='large' />
      </View>
    )
  }

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
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
          No Expenses Yet
        </Text>
        <Text
          variant='pSm'
          color='muted'
          style={styles.emptyDescription}
        >
          Your expense history will appear here once you start tracking
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={groupedItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}
