import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingTop: theme.space(4),
  },
  headerContainer: {
    paddingHorizontal: theme.space(4),
    marginBottom: theme.space(3),
  },
  subHeader: {
    marginTop: theme.space(1),
  },
  progressContainer: {
    paddingHorizontal: theme.space(4),
    marginBottom: theme.space(3),
  },
  cardContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.space(4),
    paddingBottom: theme.space(4),
  },
  actionsRow: {
    paddingHorizontal: theme.space(4),
    paddingTop: theme.space(2),
    paddingBottom: theme.space(4),
    flexDirection: 'row',
    gap: theme.gap(3),
  },
}))
