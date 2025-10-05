import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    marginVertical: 20,
  },
  sectionTitle: {
    marginBottom: 20,
    color: theme.colors.black,
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
    marginTop: 12,
    marginBottom: 100,
  },
  emptyImage: {
    width: 250,
    height: 250,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    ...theme.elevation[2],
  },
  placeholderContainer: {
    padding: 20,
    backgroundColor: theme.colors.grey5,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderText: {
    color: theme.colors.grey3,
    fontStyle: 'italic',
  },
}))
