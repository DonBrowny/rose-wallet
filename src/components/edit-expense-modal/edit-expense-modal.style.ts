import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  overlay: {
    borderRadius: 16,
    padding: 0,
    width: '90%',
    maxWidth: 360,
  },
  overlayContent: {
    padding: theme.space(5),
    gap: theme.gap(2),
  },
  loadingContainer: {
    padding: theme.space(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    padding: theme.space(4),
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(3),
  },
}))
