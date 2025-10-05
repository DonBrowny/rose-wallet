import { Text } from '@/components/ui/text/text'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useStyles } from './about-screen.styles'

export const AboutScreen = () => {
  const styles = useStyles()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text
          variant='pMd'
          style={styles.sectionTitle}
        >
          Version
        </Text>
        <Text
          variant='pSm'
          color='muted'
        >
          1.0.0
        </Text>
      </View>

      <View style={styles.section}>
        <Text
          variant='pMd'
          style={styles.sectionTitle}
        >
          Description
        </Text>
        <Text
          variant='pSm'
          color='muted'
        >
          Rose Wallet helps you track your expenses by automatically parsing SMS messages from your bank and
          categorizing your transactions.
        </Text>
      </View>

      <View style={styles.section}>
        <Text
          variant='pMd'
          style={styles.sectionTitle}
        >
          Features
        </Text>
        <Text
          variant='pSm'
          color='muted'
        >
          • Automatic SMS parsing{'\n'}• Expense categorization{'\n'}• Budget tracking{'\n'}• Transaction history
          {'\n'}• Pattern learning
        </Text>
      </View>

      <View style={styles.section}>
        <Text
          variant='pMd'
          style={styles.sectionTitle}
        >
          Privacy
        </Text>
        <Text
          variant='pSm'
          color='muted'
        >
          Your data stays on your device. We don&apos;t collect or store any personal information.
        </Text>
      </View>
    </SafeAreaView>
  )
}
