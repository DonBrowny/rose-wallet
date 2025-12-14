import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.gap(3),
    paddingHorizontal: theme.space(5),
  },
  image: {
    width: 200,
    height: 200,
  },
  lottieAnimation: {
    width: '100%',
    height: 60,
  },
  centerText: {
    textAlign: 'center',
  },
}))
