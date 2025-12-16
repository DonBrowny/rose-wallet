import { Text } from '@/components/ui/text/text'
import { formatCurrency } from '@/utils/formatter/format-currency'
import { Calendar } from 'lucide-react-native'
import { View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './expense-group-header.styles'

interface ExpenseGroupHeaderProps {
  date: string
  total: number
  count: number
}

export function ExpenseGroupHeader({ date, total, count }: ExpenseGroupHeaderProps) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.iconContainer}>
          <Calendar
            size={14}
            color={theme.colors.primary}
          />
        </View>
        <Text
          variant='pMdBold'
          color='primary'
        >
          {date}
        </Text>
      </View>
      <View style={styles.right}>
        <Text
          variant='pSmBold'
          style={styles.total}
        >
          {formatCurrency(total)}
        </Text>
        <Text
          variant='pSm'
          color='muted'
        >
          {count} {count === 1 ? 'expense' : 'expenses'}
        </Text>
      </View>
    </View>
  )
}
