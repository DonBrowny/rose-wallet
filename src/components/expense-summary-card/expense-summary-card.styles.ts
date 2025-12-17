import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: theme.space(4),
    marginBottom: theme.space(4),
    gap: theme.space(4),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  amount: {
    marginVertical: theme.space(1),
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(1),
  },
  countContainer: {
    alignItems: 'center',
    paddingLeft: theme.space(3),
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.grey2,
  },
  countNumber: {
    marginBottom: theme.space(0.5),
  },
}))
