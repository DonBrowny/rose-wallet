import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  sampleList: {
    rowGap: 12,
    marginBottom: 20,
  },
  sampleCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.grey2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
}))
