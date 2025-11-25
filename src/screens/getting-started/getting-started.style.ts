import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.space(4),
    paddingTop: theme.space(4),
    paddingBottom: theme.space(6),
    gap: theme.gap(3),
  },
  title: {
    marginBottom: theme.space(1),
  },
  subtitle: {
    marginBottom: theme.space(2),
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.space(3),
    gap: theme.gap(2),
    ...theme.elevation[1],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
  },
  rowMain: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.gap(2),
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: theme.space(1.5),
    paddingVertical: theme.space(0.5),
  },
}))
