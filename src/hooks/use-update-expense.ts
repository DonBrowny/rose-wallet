import { getOrCreateCategoryIdByName } from '@/services/database/categories-repository'
import { ensureMerchantCategoryGroup } from '@/services/database/merchant-category-groups-repository'
import { getOrCreateMerchantIdByName } from '@/services/database/merchants-repository'
import { updateTransaction } from '@/services/database/transactions-repository'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EXPENSES_BY_MONTH_QUERY_KEY, MONTH_TOTAL_QUERY_KEY } from './use-get-expenses-by-month'
import { GETTING_STARTED_TRANSACTIONS_QUERY_KEY } from './use-getting-started'
import { RECENT_EXPENSES_QUERY_KEY } from './use-get-recent-expenses'

interface UpdateExpenseParams {
  id: number
  amount: number
  merchantName: string
  categoryName: string
}

async function updateExpenseWithNames(params: UpdateExpenseParams) {
  const { id, amount, merchantName, categoryName } = params

  const merchantId = await getOrCreateMerchantIdByName(merchantName || 'Unknown')
  const categoryId = await getOrCreateCategoryIdByName(categoryName || 'Other')

  await updateTransaction({
    id,
    amount,
    merchantId,
    categoryId,
  })

  await ensureMerchantCategoryGroup(merchantId, categoryId)
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateExpenseWithNames,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MONTH_TOTAL_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: EXPENSES_BY_MONTH_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: RECENT_EXPENSES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [GETTING_STARTED_TRANSACTIONS_QUERY_KEY] })
    },
  })
}
