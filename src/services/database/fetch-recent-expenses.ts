import { categories, merchants, transactions } from '@/db/schema'
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
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .leftJoin(merchants, eq(transactions.merchantId, merchants.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.type, 'debit'))
    .orderBy(desc(transactions.createdAt))
    .limit(limit)

  return result.map((row) => ({
    id: row.id,
    amount: row.amount,
    merchantName: row.merchantName ?? 'Unknown',
    categoryName: row.categoryName ?? 'Uncategorized',
    createdAt: row.createdAt,
  }))
}
