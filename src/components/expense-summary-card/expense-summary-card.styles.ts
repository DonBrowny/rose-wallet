import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accentRed,
    borderRadius: 16,
    padding: theme.space(4),
    marginBottom: theme.space(4),
    gap: theme.space(4),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  amount: {
    marginVertical: theme.space(1),
  },
}))
