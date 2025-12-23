import { resetDatabase } from '@/services/database/db'
import { storage } from '@/utils/mmkv/storage'

/**
 * Resets the app by clearing all data from the database and MMKV storage.
 * This is a destructive operation and cannot be undone.
 */
export function resetApp(): void {
  // Clear all table data from the database
  resetDatabase()

  // Clear all MMKV storage
  storage.clearAll()
}
