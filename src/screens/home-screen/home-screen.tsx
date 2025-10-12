import { BudgetCard } from '@/components/budget-card/budget-card'
import { HomeHeader } from '@/components/home-header/home-header'
import { RecentTransactions } from '@/components/recent-transactions/recent-transactions'
import { BudgetProvider } from '@/contexts/budget-context'
import { View } from 'react-native'
import { styles } from './home-screen.styles'

export const HomeScreen = () => {
  return (
    <BudgetProvider>
      <View style={styles.container}>
        <HomeHeader />
        <BudgetCard />
        <RecentTransactions />
      </View>
    </BudgetProvider>
  )
}
