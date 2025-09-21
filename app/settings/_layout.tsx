import { HeaderBackButton } from '@/components/header-back-button/header-back-button'
import { theme } from '@/theme/rne-theme'
import { Stack } from 'expo-router'

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.lightColors?.white,
        },
        headerTintColor: theme.lightColors?.black,
        headerTitleAlign: 'center',
        headerShown: true,
        headerBackVisible: true,
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='about'
        options={{
          headerTitle: 'About',
          headerShown: true,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name='patterns'
        options={{
          headerTitle: 'SMS Patterns',
          headerShown: true,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
    </Stack>
  )
}
