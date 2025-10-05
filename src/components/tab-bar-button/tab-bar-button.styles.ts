import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 30,
    overflow: 'hidden',
  },
}))
