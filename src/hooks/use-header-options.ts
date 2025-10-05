import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { useMemo } from 'react'
import { useUnistyles } from 'react-native-unistyles'

export function useHeaderOptions() {
  const { theme } = useUnistyles()

  const headerOptions = useMemo(
    (): NativeStackNavigationOptions => ({
      headerStyle: {
        backgroundColor: theme.colors.surface,
      },
      headerTintColor: theme.colors.onSurface,
      headerTitleAlign: 'center',
      headerShown: true,
      headerBackVisible: true,
    }),
    [theme.colors.surface, theme.colors.onSurface]
  )

  return headerOptions
}
