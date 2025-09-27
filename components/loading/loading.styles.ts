import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.background,
  },
  image: {
    width: 200,
    height: 200,
  },
  lottieAnimation: {
    width: '100%',
    height: 60,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
}))
