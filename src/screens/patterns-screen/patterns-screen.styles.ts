import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  patternsListContent: {
    rowGap: 12,
    paddingBottom: 60,
  },
}))
