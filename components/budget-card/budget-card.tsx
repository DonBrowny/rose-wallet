import { Text } from '@/components/ui/text'
import { calculateBudgetData } from '@/utils/formatter/calculate-budget-data'
import { Card } from '@rneui/themed'
import React, { useMemo, useState } from 'react'
import { View } from 'react-native'
import { useStyles } from './budget-card.style'
import { BudgetInfoRows } from './budget-info-rows/budget-info-rows'
import { GaugeChart } from './gauge-chart/gauge-chart'

export function BudgetCard() {
  const styles = useStyles()
  const [budget, setBudget] = useState(65000)
  const [totalExpense] = useState(55029.75)

  const { dailyAllowanceMessage, remainingDays, dailyAllowance, spentFormatted, budgetFormatted, isOverBudget } =
    useMemo(() => calculateBudgetData(budget, totalExpense), [budget, totalExpense])

  const handleBudgetChange = (newBudget: number) => {
    setBudget(newBudget)
  }

  return (
    <Card>
      <View style={styles.header}>
        <Text variant='h4'>Budget Overview</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.gaugeChartContainer}>
          <GaugeChart
            minValue={0}
            maxValue={budget}
            currentValue={totalExpense}
          />
          <View style={styles.dailyAllowanceContainer}>
            <Text variant='pMdBold'>{dailyAllowanceMessage}</Text>
            {remainingDays > 0 && dailyAllowance > 0 && (
              <Text
                variant='pSm'
                style={styles.dailyAllowanceDays}
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
          currentBudget={budget}
          onBudgetChange={handleBudgetChange}
        />
      </View>
    </Card>
  )
}
