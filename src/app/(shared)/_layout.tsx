import { useHeaderOptions } from '@/hooks/use-header-options'
import { useScreenHeaderOptions } from '@/hooks/use-screen-header-options'
import { Stack } from 'expo-router'

export default function SharedLayout() {
  const headerOptions = useHeaderOptions()
  const addExpenseOptions = useScreenHeaderOptions({ title: 'Add Expense' })
  const patternsOptions = useScreenHeaderOptions({ title: 'SMS Patterns' })
  const patternReviewOptions = useScreenHeaderOptions({ title: 'Pattern Review', headerShown: false })
  const gettingStartedOptions = useScreenHeaderOptions({ title: 'Getting Started', headerShown: false })
  const expenseHistoryOptions = useScreenHeaderOptions({ title: 'Expense History' })

  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen
        name='add-expense'
        options={addExpenseOptions}
      />
      <Stack.Screen
        name='patterns'
        options={patternsOptions}
      />
      <Stack.Screen
        name='pattern-review'
        options={patternReviewOptions}
      />
      <Stack.Screen
        name='getting-started'
        options={gettingStartedOptions}
      />
      <Stack.Screen
        name='expense-history'
        options={expenseHistoryOptions}
      />
    </Stack>
  )
}
