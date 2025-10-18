import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.gap(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: { width: 200, height: 200 },
  list: {
    alignSelf: 'stretch',
    marginTop: theme.space(2),
    paddingHorizontal: theme.space(2),
    gap: theme.gap(1),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
  },
  bulletText: {
    textAlign: 'left',
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  overlay: {
    borderRadius: 16,
    padding: 0,
    width: '90%',
    maxWidth: 360,
  },
  overlayContent: {
    padding: theme.space(5),
    gap: theme.gap(2),
    maxHeight: '80%',
  },
  overlayTitle: {
    textAlign: 'center',
  },
}))
