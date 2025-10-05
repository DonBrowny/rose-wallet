import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  rightSection: {
    flex: 1,
    gap: 8,
  },
  infoRow: {
    paddingVertical: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}))
