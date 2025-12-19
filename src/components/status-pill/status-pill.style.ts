import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flexShrink: 0,
    paddingHorizontal: theme.space(2),
    paddingVertical: theme.space(1),
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
  },
  pending: {
    backgroundColor: theme.colors.warning,
  },
  done: {
    backgroundColor: theme.colors.success,
  },
  locked: {
    backgroundColor: theme.colors.grey3,
  },
  rejected: {
    backgroundColor: theme.colors.error,
  },
}))
