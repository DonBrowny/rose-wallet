import { BudgetCard } from '@/components/budget-card/budget-card'
import { HomeHeader } from '@/components/home-header/home-header'
import { RecentTransactions } from '@/components/recent-transactions/recent-transactions'
import { View } from 'react-native'
import { useStyles } from './home-screen.styles'

export const HomeScreen = () => {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <HomeHeader />
      <BudgetCard />
      <RecentTransactions />
    </View>
  )
}
