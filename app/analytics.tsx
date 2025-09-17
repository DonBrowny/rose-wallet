import { Text, View } from 'react-native'
import { useStyles } from './analytics.styles'

export default function AnalyticsScreen() {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics</Text>
      <Text style={styles.subtitle}>Your spending insights and trends</Text>
    </View>
  )
}
