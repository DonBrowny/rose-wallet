import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  header: {
    marginBottom: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  gaugeChartContainer: {
    flex: 1,
    alignItems: 'center',
    maxWidth: '50%',
  },
  dailyAllowanceContainer: {
    width: '100%',
    alignItems: 'center',
  },
  dailyAllowanceDays: {
    color: theme.colors.grey4,
  },
}))
