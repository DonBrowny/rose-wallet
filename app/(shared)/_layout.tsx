import { useHeaderOptions } from '@/hooks/use-header-options'
import { useScreenHeaderOptions } from '@/hooks/use-screen-header-options'
import { Stack } from 'expo-router'

export default function SharedLayout() {
  const headerOptions = useHeaderOptions()
  const addExpenseOptions = useScreenHeaderOptions({ title: 'Add Expense' })
  const patternsOptions = useScreenHeaderOptions({ title: 'SMS Patterns' })

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
    </Stack>
  )
}
