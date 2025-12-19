import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flexShrink: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    color: '#FFFFFF',
  },
  pending: {
    backgroundColor: theme.colors.warning,
  },
  done: {
    backgroundColor: theme.colors.success,
  },
  locked: {
    backgroundColor: theme.colors.grey3,
  },
}))
