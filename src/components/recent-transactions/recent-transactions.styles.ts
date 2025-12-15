import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.space(3),
    marginTop: theme.space(5),
    paddingBottom: 160,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.space(10),
    marginTop: theme.space(3),
    marginBottom: 100,
  },
  emptyImage: {
    width: 250,
    height: 250,
  },
  emptyTitle: {
    marginBottom: theme.space(2),
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: theme.space(4),
  },
  addButton: {
    ...theme.elevation[2],
  },
  loadingContainer: {
    padding: theme.space(8),
    alignItems: 'center',
  },
  listContainer: {
    marginTop: theme.space(4),
    minHeight: 400,
  },
}))
