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
    gap: theme.gap(3),
  },
  overlayTitle: {
    textAlign: 'center',
  },
  warningText: {
    textAlign: 'center',
  },
  overlayButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.gap(2),
  },
  resetButton: {
    backgroundColor: theme.colors.error,
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
}))
