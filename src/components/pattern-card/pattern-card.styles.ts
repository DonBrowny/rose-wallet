import { type DistinctPattern } from '@/types/sms/transaction'
import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
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
  statusPill: (status: DistinctPattern['status']) => ({
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 6,
    backgroundColor:
      status === 'approved'
        ? theme.colors.accentGreen
        : status === 'rejected'
          ? theme.colors.accentRed
          : theme.colors.accentOrange,
  }),
  statusIcon: {
    marginRight: 2,
    color: theme.colors.onSurface,
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
}))
