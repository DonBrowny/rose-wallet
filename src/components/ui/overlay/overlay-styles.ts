import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  card: {
    width: '90%',
    maxWidth: 360,
    borderRadius: 16,
    padding: theme.space(4),
    backgroundColor: theme.colors.surface ?? theme.colors.surface,
    ...theme.elevation[3],
  },
  fullscreen: {
    flex: 1,
    alignSelf: 'stretch',
  },
}))
