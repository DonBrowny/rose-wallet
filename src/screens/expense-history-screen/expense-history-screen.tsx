import { ExpenseGroupHeader } from '@/components/expense-group-header/expense-group-header'
import { ExpenseRow } from '@/components/expense-row/expense-row'
import { ExpenseSummaryCard } from '@/components/expense-summary-card/expense-summary-card'
import { MonthPicker } from '@/components/month-picker/month-picker'
import { Text } from '@/components/ui/text/text'
import { useGetExpensesByMonth, useGetMonthTotal } from '@/hooks/use-get-expenses-by-month'
import { getPreviousMonth } from '@/utils/date/get-previous-month'
import { GroupedExpenseItem, groupExpensesByDate } from '@/utils/expense/group-expenses-by-date'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { styles } from './expense-history-screen.styles'

export function ExpenseHistoryScreen() {
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())

  const insets = useSafeAreaInsets()
  const previousMonth = getPreviousMonth(selectedYear, selectedMonth)

  const { data: expenses = [], isLoading } = useGetExpensesByMonth(selectedYear, selectedMonth)
  const { data: previousMonthTotal } = useGetMonthTotal(previousMonth.year, previousMonth.month)

  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth()

  const groupedItems = useMemo(() => groupExpensesByDate(expenses), [expenses])

  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])

  const uniqueDays = useMemo(() => {
    const days = new Set(
      groupedItems.filter((item) => item.type === 'header').map((item) => item.type === 'header' && item.date)
    )
    return days.size
  }, [groupedItems])

  const handleMonthSelect = useCallback((year: number, month: number) => {
    setSelectedYear(year)
    setSelectedMonth(month)
  }, [])

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
        previousMonthTotal={previousMonthTotal}
        isCurrentMonth={isCurrentMonth}
      />
    ),
    [totalSpent, expenses.length, uniqueDays, previousMonthTotal, isCurrentMonth]
  )

  if (isLoading) {
    return (
      <View style={styles.container}>
        <MonthPicker
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onMonthSelect={handleMonthSelect}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' />
        </View>
      </View>
    )
  }

  if (expenses.length === 0) {
    return (
      <View style={styles.container}>
        <MonthPicker
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onMonthSelect={handleMonthSelect}
        />
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
            No Expenses
          </Text>
          <Text
            variant='pSm'
            color='muted'
            style={styles.emptyDescription}
          >
            No expenses recorded for this month
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MonthPicker
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onMonthSelect={handleMonthSelect}
      />
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
