import { StyleSheet } from 'react-native-unistyles'
import { ButtonProps } from './button-props'

const iconMd = 36
const iconSm = 30
const getIconSize = (size: ButtonProps['size']) => {
  if (size === 'icon') return iconMd
  if (size === 'icon-sm') return iconSm
  return undefined
}

const getPaddingHorizontal = (size: ButtonProps['size']) => {
  if (size === 'icon') return 0
  if (size === 'icon-sm') return 0
  return 4
}

const getPaddingVertical = (size: ButtonProps['size']) => {
  if (size === 'icon') return 0
  if (size === 'icon-sm') return 0
  return 2
}

const getBorderRadius = (size: ButtonProps['size']) => {
  if (size === 'icon' || size === 'icon-sm') return 999
  return 20
}

export const styles = StyleSheet.create((theme) => ({
  container: (type: ButtonProps['type'], disabled: boolean, size: ButtonProps['size'] = 'md') => ({
    paddingHorizontal: theme.space(getPaddingHorizontal(size)),
    paddingVertical: theme.space(getPaddingVertical(size)),
    width: getIconSize(size),
    height: getIconSize(size),
    borderRadius: getBorderRadius(size),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(1),
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor:
      type === 'solid' ? theme.colors.primary : type === 'destructive' ? theme.colors.error : 'transparent',
    borderColor: type === 'destructive' ? theme.colors.error : theme.colors.primary,
    opacity: disabled ? 0.5 : 1,
  }),
  label: (type: 'solid' | 'outline' | 'destructive') => ({
    color: type === 'outline' ? theme.colors.primary : theme.colors.surface,
  }),
}))
