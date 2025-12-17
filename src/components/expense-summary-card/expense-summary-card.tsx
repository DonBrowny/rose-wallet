import { Text } from '@/components/ui/text/text'
import { formatCountDiff } from '@/utils/formatter/format-count-diff'
import { formatCurrency } from '@/utils/formatter/format-currency'
import { calculatePercentageChange } from '@/utils/math/calculate-percentage-change'
import { getDiffColor, getTrendConfig, getTrendDirection } from '@/utils/trend/get-trend-config'
import { memo } from 'react'
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

export const ExpenseSummaryCard = memo(function ExpenseSummaryCard({
  totalSpent,
  expenseCount,
  previousMonthTotal,
  previousMonthCount,
  isCurrentMonth = false,
}: ExpenseSummaryCardProps) {
  const { theme } = useUnistyles()

  const hasComparison = previousMonthTotal !== undefined && previousMonthTotal > 0 && isCurrentMonth
  const percentageChange = hasComparison ? calculatePercentageChange(totalSpent, previousMonthTotal) : 0
  const trendDirection = getTrendDirection(percentageChange)
  const {
    TrendIcon,
    ArrowIcon,
    color: trendColor,
    background: cardBackground,
  } = getTrendConfig(trendDirection, theme.colors)

  const countDiff = previousMonthCount !== undefined ? expenseCount - previousMonthCount : 0
  const showCountDiff = hasComparison && previousMonthCount !== undefined && previousMonthCount > 0
  const countDiffColor = getDiffColor(countDiff, theme.colors)

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
        {hasComparison && trendDirection !== 'same' ? (
          <View style={styles.comparisonRow}>
            <ArrowIcon
              size={14}
              color={trendColor}
            />
            <Text
              variant='pSm'
              style={{ color: trendColor }}
            >
              {Math.abs(percentageChange)}% {trendDirection === 'up' ? 'more' : 'less'} than last month
            </Text>
          </View>
        ) : hasComparison && trendDirection === 'same' ? (
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
})
