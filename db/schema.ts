import { AnySQLiteColumn, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const smsMessages = sqliteTable('sms_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sender: text('sender').notNull(),
  body: text('body').notNull(),
  dateTime: integer('date_time', { mode: 'timestamp' }).notNull(),
})

export const merchants = sqliteTable('merchants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
})

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  parentId: integer('parent_id').references((): AnySQLiteColumn => categories.id),
})

export const merchantCategoryGroups = sqliteTable('merchant_category_groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  merchantId: integer('merchant_id')
    .references(() => merchants.id)
    .notNull(),
  categoryId: integer('category_id')
    .references(() => categories.id)
    .notNull(),
})

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  smsId: integer('sms_id').references(() => smsMessages.id),
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('INR'),
  type: text('type').notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => categories.id),
  merchantId: integer('merchant_id').references(() => merchants.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const patterns = sqliteTable(
  'patterns',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    groupingPattern: text('grouping_pattern').notNull(),
    extractionPattern: text('extraction_pattern').notNull(),
    type: text('type').notNull().default('debit'),
    status: text('status').notNull().default('needs-review'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    usageCount: integer('usage_count').notNull().default(0),
    lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    uniquePatternName: uniqueIndex('unique_patterns_name').on(table.name),
  })
)

export const patternSmsGroup = sqliteTable('pattern_sms_group', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patternId: integer('pattern_id')
    .references(() => patterns.id)
    .notNull(),
  smsId: integer('sms_id')
    .references(() => smsMessages.id)
    .notNull(),
  confidence: real('confidence').notNull().default(1.0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export type SmsMessage = typeof smsMessages.$inferSelect
export type NewSmsMessage = typeof smsMessages.$inferInsert

export type Merchant = typeof merchants.$inferSelect
export type NewMerchant = typeof merchants.$inferInsert

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert

export type MerchantCategoryGroup = typeof merchantCategoryGroups.$inferSelect
export type NewMerchantCategoryGroup = typeof merchantCategoryGroups.$inferInsert

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert

export type Pattern = typeof patterns.$inferSelect
export type NewPattern = typeof patterns.$inferInsert

export type PatternSmsGroup = typeof patternSmsGroup.$inferSelect
export type NewPatternSmsGroup = typeof patternSmsGroup.$inferInsert
