import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: theme.space(3),
    marginVertical: theme.space(5),
  },
  sectionTitle: {
    marginBottom: theme.space(5),
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
  placeholderContainer: {
    padding: theme.space(5),
    backgroundColor: theme.colors.grey5,
    borderRadius: 12,
    alignItems: 'center',
  },
}))
