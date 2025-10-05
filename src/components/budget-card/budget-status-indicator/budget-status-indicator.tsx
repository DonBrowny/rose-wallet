import { Text } from '@/components/ui/text/text'
import { cactus } from '@lucide/lab'
import { useTheme } from '@rneui/themed'
import { Flower, Icon, Sprout } from 'lucide-react-native'
import React from 'react'
import { View } from 'react-native'
import { useStyles } from './budget-status-indicator.style'

interface BudgetStatusIndicatorProps {
  monthlyBudget: number
  totalExpense: number
  currentDate?: Date
}

export function BudgetStatusIndicator({
  monthlyBudget,
  totalExpense,
  currentDate = new Date(),
}: BudgetStatusIndicatorProps) {
  const { theme } = useTheme()
  const styles = useStyles()

  const calculateWeeklyPace = () => {
    const now = currentDate
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysSinceFirstEntry = Math.max(
      1,
      Math.ceil((now.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24))
    )
    const windowDays = Math.min(7, daysSinceFirstEntry)
    const budgetPerDay = monthlyBudget / daysInMonth
    const expectedThisWeek = budgetPerDay * windowDays

    // TODO: For now, we'll use totalExpense as spent this week (in real app, this would be actual weekly transactions)
    const spentThisWeek = totalExpense * (windowDays / daysSinceFirstEntry)
    const weeklyPaceRatio = spentThisWeek / expectedThisWeek
    const deltaPerWeek = spentThisWeek - expectedThisWeek

    return {
      expectedThisWeek,
      spentThisWeek,
      deltaPerWeek,
      weeklyPaceRatio,
      windowDays,
    }
  }

  const weeklyPace = calculateWeeklyPace()

  const formatWeeklyCurrency = (amount: number) => {
    if (amount >= 10000000) {
      // 1 crore
      return `₹${(amount / 10000000).toFixed(1)}Cr/w`
    } else if (amount >= 100000) {
      // 1 lakh
      return `₹${(amount / 100000).toFixed(1)}L/w`
    } else if (amount >= 1000) {
      // 1 thousand
      return `₹${(amount / 1000).toFixed(1)}k/w`
    } else {
      return `₹${Math.round(amount)}/w`
    }
  }

  // Get garden-themed status based on weekly pace ratio
  const getGardenStatus = () => {
    if (weeklyPace.weeklyPaceRatio > 1.05) {
      return {
        icon: (
          <Icon
            iconNode={cactus}
            size={16}
            color={theme.colors.error}
          />
        ),
        text: 'Over',
        color: 'error',
        bgColor: theme.colors.accentRed,
      }
    } else if (weeklyPace.weeklyPaceRatio >= 0.9) {
      return {
        icon: (
          <Sprout
            size={16}
            color={theme.colors.warning}
          />
        ),
        text: 'Near',
        color: 'warning',
        bgColor: theme.colors.accentYellow,
      }
    } else {
      return {
        icon: (
          <Flower
            size={16}
            color={theme.colors.success}
          />
        ),
        text: 'On',
        color: 'success',
        bgColor: theme.colors.accentGreen,
      }
    }
  }

  const gardenStatus = getGardenStatus()
  const weeklyAmount = formatWeeklyCurrency(weeklyPace.spentThisWeek)

  return (
    <View style={[styles.statusIndicator, { backgroundColor: gardenStatus.bgColor + '60' }]}>
      {gardenStatus.icon}
      <Text
        variant='pSm'
        color={gardenStatus.color}
      >
        {gardenStatus.text} · {weeklyAmount}
      </Text>
    </View>
  )
}
