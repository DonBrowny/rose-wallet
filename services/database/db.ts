import { DB_NAME } from '@/types/constants'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite'

let sqliteInstance: SQLiteDatabase | null = null

export function getSQLite(): SQLiteDatabase {
  if (!sqliteInstance) {
    sqliteInstance = openDatabaseSync(DB_NAME)
  }
  return sqliteInstance
}

export function getDrizzleDb() {
  return drizzle(getSQLite())
}
