import { Text } from '@/components/ui/text/text'
import { formatCurrency } from '@/utils/formatter/format-currency'
import { TrendingDown } from 'lucide-react-native'
import { View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './expense-summary-card.styles'

interface ExpenseSummaryCardProps {
  totalSpent: number
  expenseCount: number
  dayCount: number
}

export function ExpenseSummaryCard({ totalSpent, expenseCount, dayCount }: ExpenseSummaryCardProps) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <TrendingDown
          size={24}
          color={theme.colors.error}
        />
      </View>
      <View style={styles.content}>
        <Text
          variant='pSm'
          color='muted'
        >
          Total Spent
        </Text>
        <Text
          variant='h4'
          style={styles.amount}
        >
          {formatCurrency(totalSpent)}
        </Text>
        <Text
          variant='pSm'
          color='muted'
        >
          {expenseCount} expenses across {dayCount} days
        </Text>
      </View>
    </View>
  )
}
