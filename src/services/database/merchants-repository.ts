import { merchants } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getDrizzleDb } from './db'

export async function getOrCreateMerchantIdByName(name: string): Promise<number> {
  const db = getDrizzleDb()
  const trimmed = name.trim()
  const existing = await db.select().from(merchants).where(eq(merchants.name, trimmed))
  if (existing[0]?.id) return existing[0].id as number
  await db.insert(merchants).values({ name: trimmed })
  const rows = await db.select().from(merchants).where(eq(merchants.name, trimmed))
  return rows[0]?.id as number
}
