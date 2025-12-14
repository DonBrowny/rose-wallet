import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  cardContainer: {
    margin: theme.space(4),
  },
  header: {
    marginBottom: theme.space(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
  },
  gaugeChartContainer: {
    flex: 1,
    alignItems: 'center',
    maxWidth: '50%',
  },
  dailyAllowanceContainer: {
    marginTop: theme.space(2),
    paddingHorizontal: theme.space(2),
    width: '100%',
    alignItems: 'center',
  },
  daysLeftSkeleton: {
    marginTop: theme.space(1),
  },
}))
