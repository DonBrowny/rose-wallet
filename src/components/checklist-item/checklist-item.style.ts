import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.space(3),
    paddingHorizontal: theme.space(4),
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    gap: theme.gap(3),
  },
  containerLocked: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPending: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  iconCompleted: {
    backgroundColor: theme.colors.success,
  },
  iconLocked: {
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
  },
  content: {
    flex: 1,
    gap: theme.gap(0.5),
  },
}))
