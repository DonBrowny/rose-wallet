import { HeaderBackButton } from '@/components/header-back-button/header-back-button'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import React, { useMemo } from 'react'
import { useHeaderOptions } from './use-header-options'

interface UseScreenHeaderOptionsProps {
  title: string
  showBackButton?: boolean
  customBackButton?: () => React.ReactNode
}

export function useScreenHeaderOptions({
  title,
  showBackButton = true,
  customBackButton,
}: UseScreenHeaderOptionsProps) {
  const baseHeaderOptions = useHeaderOptions()

  const screenOptions = useMemo(
    (): NativeStackNavigationOptions => ({
      ...baseHeaderOptions,
      headerTitle: title,
      headerLeft: showBackButton ? customBackButton || (() => React.createElement(HeaderBackButton)) : undefined,
    }),
    [baseHeaderOptions, title, showBackButton, customBackButton]
  )

  return screenOptions
}
