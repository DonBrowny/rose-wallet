import { MMKV_KEYS } from '@/types/mmkv-keys'
import { MMKV } from 'react-native-mmkv'

// Singleton MMKV instance (default ID: 'mmkv.default')
export const storage = new MMKV()

/**
 * Updates the last read SMS timestamp.
 * Adds 1ms to ensure the processed SMS is excluded from future queries
 * since the native query uses >= (inclusive).
 */
export function updateLastReadSmsTimestamp(smsDate: number): void {
  storage.set(MMKV_KEYS.SMS.LAST_READ_AT, smsDate + 1)
}
