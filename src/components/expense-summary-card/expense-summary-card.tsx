import { Text } from '@/components/ui/text/text'
import { formatCountDiff } from '@/utils/formatter/format-count-diff'
import { formatCurrency } from '@/utils/formatter/format-currency'
import { calculatePercentageChange } from '@/utils/math/calculate-percentage-change'
import { ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp } from 'lucide-react-native'
import { View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './expense-summary-card.styles'

interface ExpenseSummaryCardProps {
  totalSpent: number
  expenseCount: number
  previousMonthTotal?: number
  previousMonthCount?: number
  isCurrentMonth?: boolean
}

export function ExpenseSummaryCard({
  totalSpent,
  expenseCount,
  previousMonthTotal,
  previousMonthCount,
  isCurrentMonth = false,
}: ExpenseSummaryCardProps) {
  const { theme } = useUnistyles()

  const hasComparison = previousMonthTotal !== undefined && previousMonthTotal > 0 && isCurrentMonth
  const percentageChange = hasComparison ? calculatePercentageChange(totalSpent, previousMonthTotal) : 0
  const isSpendingUp = percentageChange > 0
  const isSpendingDown = percentageChange < 0
  const isSpendingSame = percentageChange === 0

  const countDiff = previousMonthCount !== undefined ? expenseCount - previousMonthCount : 0
  const showCountDiff = hasComparison && previousMonthCount !== undefined && previousMonthCount > 0

  const TrendIcon = isSpendingUp ? TrendingUp : isSpendingDown ? TrendingDown : Minus
  const ArrowIcon = isSpendingUp ? ArrowUp : isSpendingDown ? ArrowDown : Minus
  const trendColor = isSpendingUp ? theme.colors.error : isSpendingDown ? theme.colors.success : theme.colors.textMuted
  const cardBackground = isSpendingUp
    ? theme.colors.accentRed
    : isSpendingDown
      ? theme.colors.accentGreen
      : theme.colors.grey0

  const countDiffColor =
    countDiff > 0 ? theme.colors.error : countDiff < 0 ? theme.colors.success : theme.colors.textMuted

  return (
    <View style={[styles.container, { backgroundColor: cardBackground }]}>
      <View style={styles.iconContainer}>
        <TrendIcon
          size={24}
          color={trendColor}
        />
      </View>
      <View style={styles.content}>
        <Text
          variant='pSm'
          color='muted'
        >
          {isCurrentMonth ? 'Spent This Month' : 'Total Spent'}
        </Text>
        <Text
          variant='h4'
          style={styles.amount}
        >
          {formatCurrency(totalSpent)}
        </Text>
        {hasComparison && !isSpendingSame ? (
          <View style={styles.comparisonRow}>
            <ArrowIcon
              size={14}
              color={trendColor}
            />
            <Text
              variant='pSm'
              style={{ color: trendColor }}
            >
              {Math.abs(percentageChange)}% {isSpendingUp ? 'more' : 'less'} than last month
            </Text>
          </View>
        ) : hasComparison && isSpendingSame ? (
          <Text
            variant='pSm'
            color='muted'
          >
            Same as last month
          </Text>
        ) : (
          <Text
            variant='pSm'
            color='muted'
          >
            {expenseCount} expenses
          </Text>
        )}
      </View>
      <View style={styles.countContainer}>
        <Text
          variant='h4'
          style={styles.countNumber}
        >
          {expenseCount}
        </Text>
        <Text
          variant='pSm'
          color='muted'
        >
          expenses
        </Text>
        {showCountDiff && countDiff !== 0 && (
          <Text
            variant='pSmBold'
            style={{ color: countDiffColor }}
          >
            {formatCountDiff(expenseCount, previousMonthCount)}
          </Text>
        )}
      </View>
    </View>
  )
}
