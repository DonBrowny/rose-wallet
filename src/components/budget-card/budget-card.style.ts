import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles(() => ({
  cardContainer: {
    margin: 16,
  },
  header: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gaugeChartContainer: {
    flex: 1,
    alignItems: 'center',
    maxWidth: '50%',
  },
  dailyAllowanceContainer: {
    marginTop: 8,
    paddingHorizontal: 8,
    width: '100%',
    alignItems: 'center',
  },
}))
