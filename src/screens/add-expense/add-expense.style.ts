import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingTop: theme.space(4),
    gap: theme.gap(1),
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
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
    backgroundColor: theme.colors.grey2,
    paddingHorizontal: theme.space(3),
    paddingVertical: theme.space(1),
    borderRadius: 20,
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
    justifyContent: 'center',
    gap: theme.gap(8),
  },
  iconCircleBase: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.elevation[2],
  },
  rejectCircle: (disabled: boolean) => ({
    backgroundColor: disabled ? theme.colors.grey3 : theme.colors.accentRed,
  }),
  confirmCircle: (disabled: boolean) => ({
    backgroundColor: disabled ? theme.colors.grey3 : theme.colors.success,
  }),
  rejectColor: (disabled: boolean) => ({
    color: disabled ? theme.colors.grey2 : theme.colors.error,
  }),
  confirmColor: (disabled: boolean) => ({
    color: disabled ? theme.colors.grey2 : theme.colors.success,
  }),
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.space(6),
  },
  lottieAnimation: {
    width: 250,
    height: 250,
  },
  completedTitle: {
    textAlign: 'center',
    marginTop: theme.space(4),
  },
  completedDescription: {
    textAlign: 'center',
    marginTop: theme.space(2),
  },
  completedButton: {
    marginTop: theme.space(6),
    minWidth: 180,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.space(4),
  },
}))
