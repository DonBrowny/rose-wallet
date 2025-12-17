import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.grey0,
    borderRadius: 12,
    paddingVertical: theme.space(3),
    paddingHorizontal: theme.space(4),
    marginTop: theme.space(4),
    marginBottom: theme.space(2),
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(2),
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.accentPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  total: {
    color: theme.colors.error,
  },
}))
