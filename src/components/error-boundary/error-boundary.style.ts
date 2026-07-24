import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space(6),
    gap: theme.gap(2),
    backgroundColor: theme.colors.background,
  },
  message: {
    textAlign: 'center',
  },
  button: {
    marginTop: theme.space(4),
    paddingHorizontal: theme.space(6),
  },
}))
