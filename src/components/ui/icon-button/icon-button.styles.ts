import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    gap: theme.gap(1),
  },
  disabled: {
    opacity: 0.5,
  },
}))
