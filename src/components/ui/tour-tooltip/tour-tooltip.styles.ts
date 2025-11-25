import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: theme.space(3),
    maxWidth: 360,
  },
  textBlock: {
    gap: theme.gap(1),
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.gap(1),
    marginTop: theme.space(2),
  },
  actionButtonContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
}))
