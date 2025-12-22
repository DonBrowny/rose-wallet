import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: (isSelected: boolean, disabled: boolean) => ({
    paddingHorizontal: theme.space(3),
    paddingVertical: theme.space(1),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: isSelected ? theme.colors.primary : 'transparent',
    opacity: disabled ? 0.5 : 1,
    overflow: 'hidden' as const,
  }),
}))
