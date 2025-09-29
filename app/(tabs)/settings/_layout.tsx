import { useHeaderOptions } from '@/hooks/use-header-options'
import { useScreenHeaderOptions } from '@/hooks/use-screen-header-options'
import { Stack } from 'expo-router'

export default function SettingsLayout() {
  const headerOptions = useHeaderOptions()
  const aboutOptions = useScreenHeaderOptions({ title: 'About' })

  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen
        name='index'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='about'
        options={aboutOptions}
      />
    </Stack>
  )
}
