import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
  },
}))
