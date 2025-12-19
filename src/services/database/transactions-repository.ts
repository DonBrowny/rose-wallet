import { categories, merchants, smsMessages, transactions } from '@/db/schema'
import type { Expense, ExpenseMonthStats, InsertTransactionInput } from '@/types/expense'
import { getMonthRange } from '@/utils/date/get-month-range'
import { and, between, count, desc, eq, sum } from 'drizzle-orm'
import { getDrizzleDb } from './db'

const DEFAULT_LIMIT = 5

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

export async function fetchMonthTotal(year: number, month: number): Promise<ExpenseMonthStats> {
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
