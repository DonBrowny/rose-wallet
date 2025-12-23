import { resetDatabase } from '@/services/database/db'
import { storage } from '@/utils/mmkv/storage'

export function resetApp(): void {
  resetDatabase()
  storage.clearAll()
}
