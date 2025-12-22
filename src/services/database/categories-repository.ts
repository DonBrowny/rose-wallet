import { categories, Category, merchantCategoryGroups, merchants } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { getDrizzleDb } from './db'

export async function getOrCreateCategoryIdByName(name: string): Promise<number> {
  const db = getDrizzleDb()
  const trimmed = name.trim()
  const existing = await db.select().from(categories).where(eq(categories.name, trimmed))
  if (existing[0]?.id) return existing[0].id as number
  await db.insert(categories).values({ name: trimmed })
  const rows = await db.select().from(categories).where(eq(categories.name, trimmed))
  return rows[0]?.id as number
}

export async function getAllCategories(): Promise<Category[]> {
  const db = getDrizzleDb()
  return db.select().from(categories)
}

export async function getFavoriteCategories(): Promise<Category[]> {
  const db = getDrizzleDb()
  return db.select().from(categories).where(eq(categories.isFavorite, true))
}

export async function setFavoriteCategories(categoryNames: string[]): Promise<Category[]> {
  const db = getDrizzleDb()
  const trimmedNames = categoryNames.map((name) => name.trim())

  await db.update(categories).set({ isFavorite: false }).where(eq(categories.isFavorite, true))

  const existingCategories = await db.select().from(categories).where(inArray(categories.name, trimmedNames))
  const existingNames = new Set(existingCategories.map((c) => c.name))
  const newNames = trimmedNames.filter((name) => !existingNames.has(name))

  if (newNames.length > 0) {
    await db.insert(categories).values(newNames.map((name) => ({ name, isFavorite: true })))
  }

  if (existingCategories.length > 0) {
    const existingIds = existingCategories.map((c) => c.id)
    await db.update(categories).set({ isFavorite: true }).where(inArray(categories.id, existingIds))
  }

  return getFavoriteCategories()
}

export async function getCategoryByMerchantName(merchantName: string): Promise<string | null> {
  const trimmedNames = merchantName.trim()
  if (!trimmedNames) return null
  if (trimmedNames === 'Unknown') return null
  const db = getDrizzleDb()
  const trimmed = merchantName.trim()

  const merchantRows = await db.select().from(merchants).where(eq(merchants.name, trimmed))
  if (!merchantRows[0]) return null

  const groupRows = await db
    .select({ categoryId: merchantCategoryGroups.categoryId })
    .from(merchantCategoryGroups)
    .where(eq(merchantCategoryGroups.merchantId, merchantRows[0].id))
    .limit(1)

  if (!groupRows[0]) return null

  const categoryRows = await db
    .select({ name: categories.name })
    .from(categories)
    .where(eq(categories.id, groupRows[0].categoryId))

  return categoryRows[0]?.name ?? null
}
