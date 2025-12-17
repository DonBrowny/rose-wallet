import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    height: 40,
  },
  listContent: {
    paddingHorizontal: theme.space(4),
  },
  pill: {
    width: 100,
    marginRight: 8,
    paddingVertical: theme.space(2),
    borderRadius: 20,
    backgroundColor: theme.colors.grey0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    fontWeight: '600',
  },
}))
