import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    gap: theme.gap(2),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space(4),
    paddingVertical: theme.space(4),
  },
  subtitle: {
    textAlign: 'center',
  },
  counter: {
    textAlign: 'center',
    marginTop: theme.space(2),
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.gap(1.5),
    marginVertical: theme.space(2),
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
    width: '100%',
    maxWidth: 300,
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
