import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    gap: 12,
    backgroundColor: theme.colors.white,
  },
  header: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  actionsRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 12,
  },
}))
