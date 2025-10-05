import { Text } from '@/components/ui/text/text'
import { useBudgetContext } from '@/contexts/budget-context'
import { calculateBudgetData } from '@/utils/formatter/calculate-budget-data'
import { Card } from '@rneui/themed'
import React, { useMemo } from 'react'
import { View } from 'react-native'
import { useStyles } from './budget-card.style'
import { BudgetInfoRows } from './budget-info-rows/budget-info-rows'
import { BudgetStatusIndicator } from './budget-status-indicator/budget-status-indicator'
import { GaugeChart } from './gauge-chart/gauge-chart'

export function BudgetCard() {
  const styles = useStyles()
  const { monthlyBudget } = useBudgetContext()
  const totalExpense = 32768

  const { dailyAllowanceMessage, remainingDays, dailyAllowance, spentFormatted, budgetFormatted, isOverBudget } =
    useMemo(() => calculateBudgetData(monthlyBudget, totalExpense), [monthlyBudget, totalExpense])

  return (
    <Card>
      <View style={styles.header}>
        <Text variant='h4'>Budget Overview</Text>
        <BudgetStatusIndicator
          monthlyBudget={monthlyBudget}
          totalExpense={totalExpense}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.gaugeChartContainer}>
          <GaugeChart
            minValue={0}
            maxValue={monthlyBudget}
            currentValue={totalExpense}
          />
          <View style={styles.dailyAllowanceContainer}>
            <Text variant='pMdBold'>{dailyAllowanceMessage}</Text>
            {remainingDays > 0 && dailyAllowance > 0 && (
              <Text
                variant='pSm'
                color='muted'
              >
                {remainingDays} day{remainingDays !== 1 ? 's' : ''} left
              </Text>
            )}
          </View>
        </View>

        <BudgetInfoRows
          spentFormatted={spentFormatted}
          budgetFormatted={budgetFormatted}
          isOverBudget={isOverBudget}
        />
      </View>
    </Card>
  )
}
