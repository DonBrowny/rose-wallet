import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  gauge: {
    width: 124,
    height: 62,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  valueDisplay: {
    zIndex: 10,
    top: 26,
  },
}))
