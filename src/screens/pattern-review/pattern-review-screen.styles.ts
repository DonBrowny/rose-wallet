import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    gap: 12,
    backgroundColor: theme.colors.surface,
  },
  header: {
    marginBottom: theme.space(3),
    paddingHorizontal: 16,
  },
  actionsRow: {
    paddingHorizontal: theme.space(4),
    flexDirection: 'row',
    gap: theme.gap(1),
  },
}))
