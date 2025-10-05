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
    flexDirection: 'row',
    alignItems: 'center',
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
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
}))
