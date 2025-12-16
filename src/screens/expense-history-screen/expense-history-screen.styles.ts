import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: theme.space(4),
    paddingBottom: 120,
  },
  sectionHeader: {
    paddingVertical: theme.space(3),
    paddingHorizontal: theme.space(1),
    marginTop: theme.space(2),
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
