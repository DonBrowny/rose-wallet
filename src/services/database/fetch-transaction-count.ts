import { transactions } from '@/db/schema'
import type { FilterOptions } from '@/types/filters'
import { count, gte } from 'drizzle-orm'
import { getDrizzleDb } from './db'

export async function fetchTransactionCount(options?: FilterOptions): Promise<number> {
  const db = getDrizzleDb()

  const query = db.select({ count: count() }).from(transactions)

  const startDate = options?.filter?.startDate
  const data = startDate ? await query.where(gte(transactions.createdAt, startDate)) : await query

  return data[0]?.count ?? 0
}
