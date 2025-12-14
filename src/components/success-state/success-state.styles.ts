import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.space(6),
  },
  lottieAnimation: {
    width: 250,
    height: 250,
  },
  title: {
    textAlign: 'center',
    marginTop: theme.space(4),
  },
  description: {
    textAlign: 'center',
    marginTop: theme.space(2),
  },
  button: {
    marginTop: theme.space(6),
    minWidth: 180,
  },
}))
