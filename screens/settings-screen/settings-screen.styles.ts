import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    gap: 24,
  },
  title: {
    marginBottom: 8,
  },
}))
