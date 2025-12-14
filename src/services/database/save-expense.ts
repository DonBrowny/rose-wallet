import { updateLastReadSmsTimestamp } from '@/utils/mmkv/storage'
import { getOrCreateCategoryIdByName } from './categories-repository'
import { ensureMerchantCategoryGroup } from './merchant-category-groups-repository'
import { getOrCreateMerchantIdByName } from './merchants-repository'
import { ensurePatternSmsGroupLink } from './patterns-repository'
import { insertEncryptedSms } from './sms-messages-repository'
import { insertTransaction } from './transactions-repository'

interface SaveExpense {
  smsBody: string
  smsSender: string
  smsDate: number
  merchantName: string
  categoryName: string
  patternId?: number
  amount: number
  currency?: string
  type?: 'debit' | 'credit'
  description?: string
}

export async function saveExpense(input: SaveExpense) {
  try {
    const merchantName = input.merchantName.trim()
    const categoryName = input.categoryName.trim()
    const { description, patternId, smsBody, smsDate, smsSender } = input

    const [merchantId, categoryId, smsId] = await Promise.all([
      getOrCreateMerchantIdByName(merchantName),
      getOrCreateCategoryIdByName(categoryName),
      insertEncryptedSms({
        sender: smsSender,
        body: smsBody,
        date: smsDate,
      }),
    ])

    await ensureMerchantCategoryGroup(merchantId, categoryId)

    if (patternId) {
      await ensurePatternSmsGroupLink(patternId, smsId, 1.0)
    }

    const amount = Number(input.amount)
    const currency = input.currency ?? 'INR'
    const type = input.type ?? 'debit'
    await insertTransaction({
      smsId,
      amount: Number.isFinite(amount) ? amount : 0,
      currency,
      type,
      description,
      categoryId,
      merchantId,
    })

    updateLastReadSmsTimestamp(input.smsDate)

    return { merchantId, categoryId, smsId, patternId }
  } catch (error) {
    console.error('saveExpense failed', error)
    throw error
  }
}
