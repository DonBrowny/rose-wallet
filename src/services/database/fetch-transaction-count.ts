import { transactions } from '@/db/schema'
import { count, gte } from 'drizzle-orm'
import { getDrizzleDb } from './db'

interface FetchTransactionCountOptions {
  filter?: {
    startDate?: Date
  }
}

export async function fetchTransactionCount(options?: FetchTransactionCountOptions): Promise<number> {
  const db = getDrizzleDb()

  const query = db.select({ count: count() }).from(transactions)

  const startDate = options?.filter?.startDate
  const data = startDate ? await query.where(gte(transactions.createdAt, startDate)) : await query

  return data[0]?.count ?? 0
}
