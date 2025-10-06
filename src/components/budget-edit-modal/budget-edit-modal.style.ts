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
  overlayTitle: {
    textAlign: 'center',
  },
  overlayButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}))
