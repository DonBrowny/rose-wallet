import { transactions } from '@/db/schema'
import { getCurrentMonthRange } from '@/utils/date/get-current-month-range'
import { and, eq, gte, lt, sum } from 'drizzle-orm'
import { getDrizzleDb } from './db'

export async function fetchMonthlyExpense(): Promise<number> {
  const db = getDrizzleDb()
  const { start, end } = getCurrentMonthRange()

  const result = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(and(eq(transactions.type, 'debit'), gte(transactions.createdAt, start), lt(transactions.createdAt, end)))

  return result[0]?.total ? Number(result[0].total) : 0
}
