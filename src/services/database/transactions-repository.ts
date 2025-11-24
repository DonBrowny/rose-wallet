import { transactions } from '@/db/schema'
import { getDrizzleDb } from './db'

export interface InsertTransactionInput {
  smsId: number
  amount: number
  currency: string
  type: 'debit' | 'credit'
  description?: string | null
  categoryId: number
  merchantId: number
}

export async function insertTransaction(input: InsertTransactionInput): Promise<void> {
  const db = getDrizzleDb()
  await db.insert(transactions).values({
    smsId: input.smsId,
    amount: input.amount,
    currency: input.currency,
    type: input.type,
    description: input.description ?? null,
    categoryId: input.categoryId,
    merchantId: input.merchantId,
  })
}
