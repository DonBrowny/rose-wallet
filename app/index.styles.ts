import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingTop: 100, // Add padding to account for the fixed header
  },
}))
