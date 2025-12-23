import * as schema from '@/db/schema'
import { DB_NAME } from '@/types/constants'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite'

let sqliteInstance: SQLiteDatabase | null = null

export function getSQLite(): SQLiteDatabase {
  if (!sqliteInstance) {
    sqliteInstance = openDatabaseSync(DB_NAME, { enableChangeListener: true })
  }
  return sqliteInstance
}

export function resetDatabase(): void {
  const db = getSQLite()

  // Get all table names from schema
  const tableNames = Object.values(schema)
    .filter(
      (value): value is typeof schema.smsMessages => typeof value === 'object' && value !== null && 'getSQL' in value
    )
    .map((table) => (table as any)[Symbol.for('drizzle:Name')])
    .filter(Boolean)

  // Disable foreign keys, delete all data, re-enable foreign keys
  db.execSync('PRAGMA foreign_keys = OFF')
  for (const tableName of tableNames) {
    db.execSync(`DELETE FROM ${tableName}`)
  }
  db.execSync('PRAGMA foreign_keys = ON')
}

export function getDrizzleDb() {
  return drizzle(getSQLite(), { schema })
}
