import { categories, merchants, smsMessages, transactions } from '@/db/schema'
import type { Expense } from '@/types/expense'
import { desc, eq } from 'drizzle-orm'
import { getDrizzleDb } from './db'

const DEFAULT_LIMIT = 5

export async function fetchRecentExpenses(limit: number = DEFAULT_LIMIT): Promise<Expense[]> {
  const db = getDrizzleDb()

  const result = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      merchantName: merchants.name,
      categoryName: categories.name,
      receivedAt: smsMessages.dateTime,
    })
    .from(transactions)
    .leftJoin(merchants, eq(transactions.merchantId, merchants.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(smsMessages, eq(transactions.smsId, smsMessages.id))
    .where(eq(transactions.type, 'debit'))
    .orderBy(desc(smsMessages.dateTime))
    .limit(limit)

  return result.map((row) => ({
    id: row.id,
    amount: row.amount,
    merchantName: row.merchantName ?? 'Unknown',
    categoryName: row.categoryName ?? 'Uncategorized',
    receivedAt: row.receivedAt ?? new Date(),
  }))
}
