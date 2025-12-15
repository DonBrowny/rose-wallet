import { BudgetCard } from '@/components/budget-card/budget-card'
import { HomeHeader } from '@/components/home-header/home-header'
import { RecentTransactions } from '@/components/recent-transactions/recent-transactions'
import { BudgetProvider } from '@/contexts/budget-context'
import { useGetRecentExpenses } from '@/hooks/use-get-recent-expenses'
import { ScrollView, View } from 'react-native'
import { styles } from './home-screen.styles'

export const HomeScreen = () => {
  const { data: expenses, isLoading } = useGetRecentExpenses()

  return (
    <BudgetProvider>
      <View style={styles.container}>
        <HomeHeader />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <BudgetCard />
          <RecentTransactions
            expenses={expenses}
            isLoading={isLoading}
          />
        </ScrollView>
      </View>
    </BudgetProvider>
  )
}
