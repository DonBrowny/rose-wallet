import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
    paddingBottom: 100, // Add padding to account for the floating tab bar
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.black,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.grey3,
    textAlign: 'center',
  },
}))
