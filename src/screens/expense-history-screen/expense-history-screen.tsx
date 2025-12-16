import { ExpenseGroupHeader } from '@/components/expense-group-header/expense-group-header'
import { ExpenseRow } from '@/components/expense-row/expense-row'
import { ExpenseSummaryCard } from '@/components/expense-summary-card/expense-summary-card'
import { Text } from '@/components/ui/text/text'
import { useGetRecentExpenses } from '@/hooks/use-get-recent-expenses'
import { GroupedExpenseItem, groupExpensesByDate } from '@/utils/expense/group-expenses-by-date'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { useCallback, useMemo } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { styles } from './expense-history-screen.styles'

const EXPENSE_HISTORY_LIMIT = 100

export function ExpenseHistoryScreen() {
  const { data: expenses = [], isLoading } = useGetRecentExpenses(EXPENSE_HISTORY_LIMIT)
  const insets = useSafeAreaInsets()

  const groupedItems = useMemo(() => groupExpensesByDate(expenses), [expenses])

  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])

  const uniqueDays = useMemo(() => {
    const days = new Set(
      groupedItems.filter((item) => item.type === 'header').map((item) => item.type === 'header' && item.date)
    )
    return days.size
  }, [groupedItems])

  const renderItem = useCallback(({ item }: { item: GroupedExpenseItem }) => {
    if (item.type === 'header') {
      return (
        <ExpenseGroupHeader
          date={item.date}
          total={item.total}
          count={item.count}
        />
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

  const ListHeader = useCallback(
    () => (
      <ExpenseSummaryCard
        totalSpent={totalSpent}
        expenseCount={expenses.length}
        dayCount={uniqueDays}
      />
    ),
    [totalSpent, expenses.length, uniqueDays]
  )

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
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ ...styles.listContent, paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}
