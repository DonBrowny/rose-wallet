import { merchantCategoryGroups } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { getDrizzleDb } from './db'

export async function ensureMerchantCategoryGroup(merchantId: number, categoryId: number): Promise<void> {
  const db = getDrizzleDb()
  const existing = await db
    .select()
    .from(merchantCategoryGroups)
    .where(and(eq(merchantCategoryGroups.merchantId, merchantId), eq(merchantCategoryGroups.categoryId, categoryId)))
  if (!existing[0]) {
    await db.insert(merchantCategoryGroups).values({ merchantId, categoryId })
  }
}
