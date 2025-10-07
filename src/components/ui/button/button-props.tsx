import { GestureResponderEvent, PressableProps, ViewStyle } from 'react-native'

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title?: string
  type?: 'solid' | 'outline' | 'destructive'
  size?: 'md' | 'icon' | 'icon-sm'
  isLoading?: boolean
  disabled?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerStyle?: ViewStyle | ViewStyle[]
  onPress?: (event: GestureResponderEvent) => void
}
