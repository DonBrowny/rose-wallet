import React from 'react'
import { ActivityIndicator, Pressable } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { Text } from '../text/text'
import { ButtonProps } from './button-props'
import { styles } from './button-styles'

export function Button({
  title,
  type = 'solid',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  containerStyle,
  onPress,
  ...rest
}: ButtonProps) {
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
      style={[styles.container(type, isDisabled, size), containerStyle]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <>
          {leftIcon}
          {size !== 'icon' && title ? (
            <Text
              variant='pMdBold'
              color={type === 'outline' ? 'primary' : 'surface'}
            >
              {title}
            </Text>
          ) : null}
          {rightIcon}
        </>
      )}
    </Pressable>
  )
}
