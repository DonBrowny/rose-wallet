import { BudgetCard } from '@/components/budget-card/budget-card'
import { HomeHeader } from '@/components/home-header/home-header'
import { Text } from '@/components/ui/text'
import { Button } from '@rneui/themed'
import { View } from 'react-native'
import { useStyles } from './index.styles'

export default function HomeScreen() {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <HomeHeader />
      <BudgetCard />
      <View style={styles.scrollContainer}>
        <Text variant='h1'>Home</Text>
        <Button title='Click Me!!' />
      </View>
    </View>
  )
}
