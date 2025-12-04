import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: theme.space(4),
    gap: theme.gap(2),
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: theme.space(4),
    gap: theme.gap(1),
    ...theme.elevation[2],
  },
  cardLocked: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  button: {
    width: 150,
  },
  pillText: {
    color: '#FFFFFF',
  },
  pillPending: {
    backgroundColor: theme.colors.warning,
  },
  pillDone: {
    backgroundColor: theme.colors.success,
  },
  pillLocked: {
    backgroundColor: theme.colors.grey3,
  },
}))
