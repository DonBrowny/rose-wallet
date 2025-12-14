import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'absolute',
    bottom: 100,
    right: theme.space(6),
    zIndex: 10,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.elevation[3],
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
}))
