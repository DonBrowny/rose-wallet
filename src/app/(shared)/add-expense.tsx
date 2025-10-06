import { Text } from '@/components/ui/text/text'
import { View } from 'react-native'

export default function AddExpenseScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant='h3'>Add Expense Screen</Text>
      <Text
        variant='pSm'
        style={{ marginTop: 8, textAlign: 'center' }}
      >
        This screen will be implemented later
      </Text>
    </View>
  )
}
