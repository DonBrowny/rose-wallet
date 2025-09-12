import { HomeHeader } from '@/components/home-header/home-header'
import { Button, Text } from '@rneui/themed'
import { View } from 'react-native'
import { useStyles } from './index.styles'

export default function HomeScreen() {
  const styles = useStyles()
  return (
    <View style={styles.container}>
      <HomeHeader />
      <Text h1>Home</Text>
      <Button title='Click Me!!' />
    </View>
  )
}
