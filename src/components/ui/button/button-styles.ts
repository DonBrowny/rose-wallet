import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: (type: 'solid' | 'outline' | 'destructive', disabled: boolean) => ({
    paddingHorizontal: theme.space(4),
    paddingVertical: theme.space(2),
    borderRadius: 20,
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
