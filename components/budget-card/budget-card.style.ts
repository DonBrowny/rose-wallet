import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
  },
  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.grey0,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.grey1,
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  budgetCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  statSubtext: {
    fontSize: 10,
    color: theme.colors.grey3,
    fontFamily: 'Manrope_600SemiBold',
  },
  overBudgetText: {
    color: theme.colors.error,
  },
  underBudgetText: {
    color: theme.colors.success,
  },

  // Progress Section
  progressSection: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: theme.colors.grey1,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressPercentage: {
    color: theme.colors.grey4,
  },
  dailyAllowanceLabel: {
    color: theme.colors.grey4,
    textAlign: 'center',
  },
}))
