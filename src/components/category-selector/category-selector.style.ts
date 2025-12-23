import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.gap(2),
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.gap(1.5),
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
  },
  customInput: {
    flex: 1,
  },
  addButton: {
    padding: theme.space(2),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  addButtonDisabled: {
    borderColor: theme.colors.textMuted,
    opacity: 0.5,
  },
}))
