import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: theme.space(4),
    gap: theme.gap(1),
    ...theme.elevation[2],
  },
  locked: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.gap(2),
  },
  title: {
    flex: 1,
  },
  button: {
    width: 150,
  },
}))
