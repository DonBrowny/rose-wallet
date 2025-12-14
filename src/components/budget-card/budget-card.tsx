import { Card } from '@/components/ui/card/card'
import { Skeleton } from '@/components/ui/skeleton/skeleton'
import { Text } from '@/components/ui/text/text'
import { useBudgetContext } from '@/contexts/budget-context'
import { useMonthlyExpense } from '@/hooks/use-monthly-expense'
import { calculateBudgetData } from '@/utils/formatter/calculate-budget-data'
import React, { useMemo } from 'react'
import { View } from 'react-native'
import { styles } from './budget-card.style'
import { BudgetInfoRows } from './budget-info-rows/budget-info-rows'
import { BudgetStatusIndicator } from './budget-status-indicator/budget-status-indicator'
import { GaugeChart } from './gauge-chart/gauge-chart'

export function BudgetCard() {
  const { monthlyBudget } = useBudgetContext()
  const { totalExpense, isLoading } = useMonthlyExpense()

  const { dailyAllowanceMessage, remainingDays, dailyAllowance, spentFormatted, budgetFormatted, isOverBudget } =
    useMemo(() => calculateBudgetData(monthlyBudget, totalExpense), [monthlyBudget, totalExpense])

  return (
    <Card style={styles.cardContainer}>
      <View style={styles.header}>
        <Text variant='h4'>Budget Overview</Text>
        {isLoading ? (
          <Skeleton
            width={100}
            height={24}
            borderRadius={12}
          />
        ) : (
          <BudgetStatusIndicator
            monthlyBudget={monthlyBudget}
            totalExpense={totalExpense}
          />
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.gaugeChartContainer}>
          {isLoading ? (
            <>
              <Skeleton
                width={124}
                height={66}
                borderRadius={8}
              />
              <View style={styles.dailyAllowanceContainer}>
                <Skeleton
                  width={100}
                  height={16}
                  borderRadius={4}
                />
                <Skeleton
                  width={70}
                  height={14}
                  borderRadius={4}
                  style={styles.daysLeftSkeleton}
                />
              </View>
            </>
          ) : (
            <>
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
            </>
          )}
        </View>

        <BudgetInfoRows
          spentFormatted={spentFormatted}
          budgetFormatted={budgetFormatted}
          isOverBudget={isOverBudget}
          isLoading={isLoading}
        />
      </View>
    </Card>
  )
}
