import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  overlay: {
    borderRadius: 16,
    padding: 0,
    width: '90%',
    maxWidth: 400,
  },
  content: {
    padding: theme.space(5),
    gap: theme.gap(2),
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  counter: {
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 200,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.gap(1),
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
  },
  customInput: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.gap(2),
    marginTop: theme.space(2),
  },
  button: {
    flex: 1,
  },
}))
