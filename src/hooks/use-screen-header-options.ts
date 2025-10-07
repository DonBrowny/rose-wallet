import { HeaderBackButton } from '@/components/header-back-button/header-back-button'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import React, { useMemo } from 'react'
import { useHeaderOptions } from './use-header-options'

interface UseScreenHeaderOptionsProps {
  title: string
  headerShown?: boolean
  showBackButton?: boolean
  customBackButton?: () => React.ReactNode
}

export function useScreenHeaderOptions({ title, headerShown, showBackButton = true }: UseScreenHeaderOptionsProps) {
  const baseHeaderOptions = useHeaderOptions(headerShown)

  const screenOptions = useMemo(
    (): NativeStackNavigationOptions => ({
      ...baseHeaderOptions,
      headerTitle: title,
      headerLeft: showBackButton ? () => React.createElement(HeaderBackButton) : undefined,
    }),
    [baseHeaderOptions, title, showBackButton]
  )

  return screenOptions
}
