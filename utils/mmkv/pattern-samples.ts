import { MMKV_KEYS } from '@/types/mmkv-keys'
import type { Transaction } from '@/types/sms/transaction'
import { storage } from './storage'

export function getPatternSamplesByName(name: string): Transaction[] {
  const json = storage.getString(MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V1)
  if (!json) return []
  try {
    const map = JSON.parse(json) as Record<string, Transaction[]>
    return map[name] || []
  } catch {
    return []
  }
}

