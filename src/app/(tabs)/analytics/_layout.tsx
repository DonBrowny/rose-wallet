import { useHeaderOptions } from '@/hooks/use-header-options'
import { useScreenHeaderOptions } from '@/hooks/use-screen-header-options'
import { Stack } from 'expo-router'

export default function AnalyticsLayout() {
  const headerOptions = useHeaderOptions()
  const expenseHistoryOptions = useScreenHeaderOptions({ title: 'Expense History' })

  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen
        name='index'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='expense-history'
        options={expenseHistoryOptions}
      />
    </Stack>
  )
}
