import { transactions } from '@/db/schema'
import { getDrizzleDb } from '@/services/database/db'
import { count } from 'drizzle-orm'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'

export function useLiveTransactionCount(): {
  count: number
  isLoading: boolean
  error: unknown
} {
  const db = getDrizzleDb()

  const { data, error } = useLiveQuery(db.select({ count: count() }).from(transactions))

  const transactionCount = data?.[0]?.count ?? 0

  return { count: transactionCount, isLoading: !data && !error, error }
}
