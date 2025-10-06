import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    gap: theme.gap(1),
  },
  inputContainer: (focused: boolean, hasError: boolean, disabled: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    gap: theme.gap(1),
    paddingHorizontal: theme.space(3),
    backgroundColor: disabled ? theme.colors.surfaceMuted : theme.colors.surface,
    borderColor: hasError ? theme.colors.error : focused ? theme.colors.primary : theme.colors.input,
    shadowColor: focused && !hasError ? theme.colors.primary : 'transparent',
    shadowOpacity: focused && !hasError ? 0.15 : 0,
    shadowRadius: focused && !hasError ? 6 : 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: focused && !hasError ? 1 : 0,
    opacity: disabled ? 0.6 : 1,
  }),
  input: {
    flex: 1,
    color: theme.colors.onSurface,
    fontFamily: theme.typography.family.regular,
    fontSize: theme.typography.size.pMd,
    lineHeight: theme.typography.line.pMd,
    letterSpacing: theme.typography.track.normal,
    paddingVertical: 0,
  },
}))
