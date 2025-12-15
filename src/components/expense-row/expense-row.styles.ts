import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.space(3),
    marginVertical: theme.space(1),
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    gap: theme.space(3),
    ...theme.elevation[1],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: theme.typography.size.pLg,
    fontFamily: theme.typography.family.bold,
    color: theme.colors.onSurface,
  },
  content: {
    flex: 1,
    gap: theme.space(1),
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: theme.space(1),
  },
  amount: {
    fontSize: theme.typography.size.pLg,
    fontFamily: theme.typography.family.monoBold,
    color: theme.colors.onSurface,
  },
  date: {
    textAlign: 'right',
  },
}))
