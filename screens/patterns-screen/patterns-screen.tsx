import { Text } from '@/components/ui/text'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useStyles } from './patterns-screen.styles'

export const PatternsScreen = () => {
  const styles = useStyles()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text
          variant='h3'
          style={styles.title}
        >
          SMS Patterns
        </Text>

        <Text
          variant='pSm'
          color='muted'
          style={styles.description}
        >
          Teach Rosie how to parse your SMS messages by adding patterns for different banks and transaction types.
        </Text>

        <View style={styles.section}>
          <Text
            variant='pMd'
            style={styles.sectionTitle}
          >
            How it works
          </Text>
          <Text
            variant='pSm'
            color='muted'
            style={styles.sectionContent}
          >
            1. Add a sample SMS message{'\n'}
            2. Rosie will learn the pattern{'\n'}
            3. Future messages will be parsed automatically{'\n'}
            4. You can edit or delete patterns anytime
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            variant='pMd'
            style={styles.sectionTitle}
          >
            Supported Banks
          </Text>
          <Text
            variant='pSm'
            color='muted'
            style={styles.sectionContent}
          >
            • HDFC Bank{'\n'}• ICICI Bank{'\n'}• SBI{'\n'}• Axis Bank{'\n'}• And many more...
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            variant='pMd'
            style={styles.sectionTitle}
          >
            Pattern Examples
          </Text>
          <Text
            variant='pSm'
            color='muted'
            style={styles.sectionContent}
          >
            Debit: "Rs.500 debited from A/c **1234 on 15-Jan-24"{'\n'}
            Credit: "Rs.1000 credited to A/c **1234 on 15-Jan-24"{'\n'}
            UPI: "Rs.250 paid to MERCHANT via UPI on 15-Jan-24"
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
