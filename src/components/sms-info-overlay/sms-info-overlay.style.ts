import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  overlay: {
    borderRadius: 16,
    padding: 0,
    width: '90%',
    maxWidth: 360,
  },
  content: {
    padding: theme.space(5),
    gap: theme.gap(2),
  },
  scrollView: {
    maxHeight: 300,
  },
  scrollContent: {
    gap: theme.gap(2),
  },
  title: {
    textAlign: 'center',
  },
  linkText: {
    textDecorationLine: 'underline',
  },
}))
