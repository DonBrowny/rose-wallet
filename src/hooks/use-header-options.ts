import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { useTheme } from '@rneui/themed'
import { useMemo } from 'react'

export function useHeaderOptions() {
  const { theme } = useTheme()

  const headerOptions = useMemo(
    (): NativeStackNavigationOptions => ({
      headerStyle: {
        backgroundColor: theme.colors.white,
      },
      headerTintColor: theme.colors.black,
      headerTitleAlign: 'center',
      headerShown: true,
      headerBackVisible: true,
    }),
    [theme.colors.white, theme.colors.black]
  )

  return headerOptions
}
