import { makeStyles } from '@rneui/themed'

export const useItemStyles = makeStyles((theme) => ({
  slide: {
    padding: 12,
  },
  slideCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.grey2,
    minHeight: 160,
  },
}))
