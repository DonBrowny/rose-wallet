import type { ReactNode } from 'react'
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'
import { styles } from './icon-button.styles'

interface IconButtonProps extends Omit<PressableProps, 'style'> {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export function IconButton({ children, disabled, style, ...props }: IconButtonProps) {
  return (
    <Pressable
      style={[styles.container, disabled && styles.disabled, style]}
      disabled={disabled}
      {...props}
    >
      {children}
    </Pressable>
  )
}
