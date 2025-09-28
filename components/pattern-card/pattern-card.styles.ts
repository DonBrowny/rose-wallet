import { type DistinctPattern } from '@/types/sms/transaction'
import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme, props: Pick<DistinctPattern, 'status'>) => ({
  cardContainer: {
    display: 'flex',
    backgroundColor: theme.colors.grey1,
    borderRadius: 24,
    margin: 0,
    padding: 16,
    rowGap: 8,
    ...theme.elevation[2],
  },
  statusContainer: {
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 6,
    backgroundColor: props.status === 'approved' ? theme.colors.accentGreen : theme.colors.accentOrange,
  },
  statusIcon: {
    marginRight: 2,
    color: theme.colors.black,
  },
  footer: {
    alignItems: 'flex-end',
  },
  reviewButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  reviewButtonText: {
    fontFamily: theme.typography.family.semibold,
    fontSize: theme.typography.size.pMd,
    fontWeight: '600',
  },
}))
