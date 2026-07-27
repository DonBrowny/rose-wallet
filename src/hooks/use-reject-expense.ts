import { SMS_MATCH_STATUS } from '@/db/schema'
import { updateSmsMatchStatusByIds } from '@/services/database/sms-messages-repository'
import type { ReviewTxn } from '@/types/sms-parsing'
import { updateLastReadSmsTimestamp } from '@/utils/mmkv/storage'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeReviewedSmsFromCache } from './use-sms-transactions'

async function rejectTransaction(transaction: ReviewTxn) {
  await updateSmsMatchStatusByIds([transaction.smsId], SMS_MATCH_STATUS.Ignored)
  updateLastReadSmsTimestamp(transaction.date)
}

export function useRejectExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: rejectTransaction,
    onSuccess: async (_result, transaction) => {
      await removeReviewedSmsFromCache(queryClient, transaction.smsId)
    },
  })
}
