import { SMS_MATCH_STATUS, TRANSACTION_TYPE, type TransactionType } from '@/db/schema'
import { updateLastReadSmsTimestamp } from '@/utils/mmkv/storage'
import { getOrCreateCategoryIdByName } from './categories-repository'
import { ensureMerchantCategoryGroup } from './merchant-category-groups-repository'
import { getOrCreateMerchantIdByName } from './merchants-repository'
import { ensurePatternSmsGroupLink } from './patterns-repository'
import { updateSmsMatchStatusByIds } from './sms-messages-repository'
import { insertTransaction } from './transactions-repository'

interface SaveExpense {
  /** Residual-queue row of the source SMS — every reviewed expense is queue-backed. */
  smsId: number
  smsDate: number
  merchantName: string
  categoryName: string
  patternId?: number
  amount: number
  currency?: string
  type?: TransactionType
  description?: string
}

export async function saveExpense(input: SaveExpense) {
  try {
    const merchantName = input.merchantName.trim()
    const categoryName = input.categoryName.trim()
    const { description, patternId, smsId, smsDate } = input

    const [merchantId, categoryId] = await Promise.all([
      getOrCreateMerchantIdByName(merchantName),
      getOrCreateCategoryIdByName(categoryName),
      updateSmsMatchStatusByIds([smsId], SMS_MATCH_STATUS.Matched),
    ])

    await ensureMerchantCategoryGroup(merchantId, categoryId)

    if (patternId) {
      await ensurePatternSmsGroupLink(patternId, smsId, 1.0)
    }

    const amount = Number(input.amount)
    const currency = input.currency ?? 'INR'
    const type = input.type ?? TRANSACTION_TYPE.Debit
    await insertTransaction({
      smsId,
      amount: Number.isFinite(amount) ? amount : 0,
      currency,
      type,
      description,
      categoryId,
      merchantId,
    })

    updateLastReadSmsTimestamp(smsDate)

    return { merchantId, categoryId, smsId, patternId }
  } catch (error) {
    console.error('saveExpense failed', error)
    throw error
  }
}
