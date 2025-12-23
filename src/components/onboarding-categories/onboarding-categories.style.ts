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
}))
