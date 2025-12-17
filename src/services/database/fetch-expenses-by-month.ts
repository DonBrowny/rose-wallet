import { categories, merchants, smsMessages, transactions } from '@/db/schema'
import type { Expense } from '@/types/expense'
import { and, between, count, desc, eq, sum } from 'drizzle-orm'
import { getDrizzleDb } from './db'

export interface MonthRange {
  start: Date
  end: Date
}

export interface MonthStats {
  total: number
  count: number
}

export function getMonthRange(year: number, month: number): MonthRange {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

export async function fetchExpensesByMonth(year: number, month: number): Promise<Expense[]> {
  const db = getDrizzleDb()
  const { start, end } = getMonthRange(year, month)

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
    .where(and(eq(transactions.type, 'debit'), between(smsMessages.dateTime, start, end)))
    .orderBy(desc(smsMessages.dateTime))

  return result.map((row) => ({
    id: row.id,
    amount: row.amount,
    merchantName: row.merchantName ?? 'Unknown',
    categoryName: row.categoryName ?? 'Uncategorized',
    receivedAt: row.receivedAt ?? new Date(),
  }))
}

export async function fetchMonthTotal(year: number, month: number): Promise<MonthStats> {
  const db = getDrizzleDb()
  const { start, end } = getMonthRange(year, month)

  const result = await db
    .select({
      total: sum(transactions.amount),
      count: count(transactions.id),
    })
    .from(transactions)
    .leftJoin(smsMessages, eq(transactions.smsId, smsMessages.id))
    .where(and(eq(transactions.type, 'debit'), between(smsMessages.dateTime, start, end)))

  return {
    total: Number(result[0]?.total) || 0,
    count: result[0]?.count || 0,
  }
}
