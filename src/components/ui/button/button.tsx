import React from 'react'
import { ActivityIndicator, GestureResponderEvent, Pressable, PressableProps, Text, ViewStyle } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './button-styles'

interface Props extends Omit<PressableProps, 'style'> {
  title?: string
  type?: 'solid' | 'outline' | 'destructive'
  isLoading?: boolean
  disabled?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerStyle?: ViewStyle | ViewStyle[]
  onPress?: (event: GestureResponderEvent) => void
}

export function Button({
  title,
  type = 'solid',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  containerStyle,
  onPress,
  ...rest
}: Props) {
  const { theme } = useUnistyles()

  const isDisabled = disabled || isLoading

  const contentColor = type === 'outline' ? theme.colors.primary : theme.colors.surface

  return (
    <Pressable
      accessibilityRole='button'
      disabled={isDisabled}
      onPress={onPress}
      android_ripple={{
        color: type === 'outline' ? 'rgba(111,108,217,0.25)' : 'rgba(255,255,255,0.25)',
        borderless: false,
        foreground: true,
      }}
      style={[styles.container(type, isDisabled), containerStyle]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <>
          {leftIcon}
          {title ? <Text style={styles.label(type)}>{title}</Text> : null}
          {rightIcon}
        </>
      )}
    </Pressable>
  )
}
