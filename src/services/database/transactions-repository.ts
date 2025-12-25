import { categories, merchants, smsMessages, transactions } from '@/db/schema'
import type { Expense, ExpenseMonthStats, InsertTransactionInput, UpdateTransactionInput } from '@/types/expense'
import { FilterOptions } from '@/types/filters'
import { decryptText } from '@/utils/crypto/secure-text'
import { getMonthRange } from '@/utils/date/get-month-range'
import { and, between, count, desc, eq, gte, sum } from 'drizzle-orm'
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

export async function updateTransaction(input: UpdateTransactionInput): Promise<void> {
  const db = getDrizzleDb()
  await db
    .update(transactions)
    .set({
      amount: input.amount,
      merchantId: input.merchantId,
      categoryId: input.categoryId,
      updatedAt: new Date(),
    })
    .where(eq(transactions.id, input.id))
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = getDrizzleDb()
  await db.delete(transactions).where(eq(transactions.id, id))
}

export async function fetchExpenseById(id: number): Promise<Expense | null> {
  const db = getDrizzleDb()

  const result = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      merchantName: merchants.name,
      categoryName: categories.name,
      receivedAt: smsMessages.dateTime,
      smsSender: smsMessages.sender,
      smsBody: smsMessages.body,
    })
    .from(transactions)
    .leftJoin(merchants, eq(transactions.merchantId, merchants.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(smsMessages, eq(transactions.smsId, smsMessages.id))
    .where(eq(transactions.id, id))
    .limit(1)

  const row = result[0]
  if (!row) return null

  return {
    id: row.id,
    amount: row.amount,
    merchantName: row.merchantName ?? 'Unknown',
    categoryName: row.categoryName ?? 'Uncategorized',
    receivedAt: row.receivedAt ?? new Date(),
    smsSender: row.smsSender ? decryptText(row.smsSender) : undefined,
    smsBody: row.smsBody ? decryptText(row.smsBody) : undefined,
  }
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

export async function getExpenseStats(options?: FilterOptions): Promise<ExpenseMonthStats> {
  const db = getDrizzleDb()
  const startDate = options?.filter?.startDate
  const endDate = options?.filter?.endDate
  const hasDateFilter = startDate || endDate

  let query = db
    .select({
      total: sum(transactions.amount),
      count: count(transactions.id),
    })
    .from(transactions)
    .$dynamic()

  if (hasDateFilter) {
    query = query.leftJoin(smsMessages, eq(transactions.smsId, smsMessages.id))
  }

  const conditions = [eq(transactions.type, 'debit')]
  if (startDate && endDate) {
    conditions.push(between(smsMessages.dateTime, startDate, endDate))
  } else if (startDate) {
    conditions.push(gte(smsMessages.dateTime, startDate))
  }

  const result = await query.where(and(...conditions))

  return {
    total: Number(result[0]?.total) || 0,
    count: result[0]?.count || 0,
  }
}
