import { AnySQLiteColumn, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const PATTERN_STATUSES = ['needs-review', 'approved', 'rejected'] as const
export type PatternStatus = (typeof PATTERN_STATUSES)[number]
export const PATTERN_STATUS = {
  NeedsReview: 'needs-review',
  Approved: 'approved',
  Rejected: 'rejected',
} as const satisfies Record<string, PatternStatus>

export const TRANSACTION_TYPES = ['debit', 'credit'] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]
export const TRANSACTION_TYPE = {
  Debit: 'debit',
  Credit: 'credit',
} as const satisfies Record<string, TransactionType>

export const SMS_MATCH_STATUSES = ['matched', 'unmatched', 'ignored'] as const
export type SmsMatchStatus = (typeof SMS_MATCH_STATUSES)[number]
export const SMS_MATCH_STATUS = {
  Matched: 'matched',
  Unmatched: 'unmatched',
  Ignored: 'ignored',
} as const satisfies Record<string, SmsMatchStatus>

export const smsMessages = sqliteTable(
  'sms_messages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sender: text('sender').notNull(),
    body: text('body').notNull(),
    dateTime: integer('date_time', { mode: 'timestamp' }).notNull(),
    matchStatus: text('match_status', { enum: SMS_MATCH_STATUSES }).notNull().default('unmatched'),
    // MurmurHash32 of the plaintext sender|date|body — dedupe key so overlapping
    // sync windows never enqueue the same SMS twice. Null on rows predating it.
    smsHash: text('sms_hash'),
  },
  (table) => ({
    uniqueSmsHash: uniqueIndex('unique_sms_hash').on(table.smsHash),
  })
)

export const merchants = sqliteTable('merchants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
})

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  parentId: integer('parent_id').references((): AnySQLiteColumn => categories.id),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
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
  type: text('type', { enum: TRANSACTION_TYPES }).notNull(),
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
    // Unused since diff-based extraction replaced compiled regexes; kept so no migration is needed.
    extractionRegex: text('extraction_regex'),
    sender: text('sender'),
    normalizerVersion: integer('normalizer_version').notNull().default(1),
    type: text('type', { enum: TRANSACTION_TYPES }).notNull().default('debit'),
    status: text('status', { enum: PATTERN_STATUSES }).notNull().default('needs-review'),
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
