import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.space(4),
  },
  listContent: {
    padding: theme.space(4),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.space(4),
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: theme.space(4),
  },
  emptyTitle: {
    marginBottom: theme.space(2),
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
  },
}))
