import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  gauge: {
    width: 120,
    height: 80,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  valueDisplay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    top: 30,
  },
}))
