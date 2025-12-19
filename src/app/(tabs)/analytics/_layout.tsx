import { useHeaderOptions } from '@/hooks/use-header-options'
import { Stack } from 'expo-router'

export default function AnalyticsLayout() {
  const headerOptions = useHeaderOptions()

  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen
        name='index'
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  )
}
