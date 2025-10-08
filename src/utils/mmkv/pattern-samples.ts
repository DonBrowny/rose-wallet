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

export function setPatternSamplesByName(name: string, samples: Transaction[]) {
  const json = storage.getString(MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V1)
  if (!json) {
    const map = { [name]: samples }
    storage.set(MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V1, JSON.stringify(map))
    return
  }
  try {
    const map = JSON.parse(json) as Record<string, Transaction[]>
    const newMap = { ...map, [name]: samples }
    storage.set(MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V1, JSON.stringify(newMap))
  } catch {
    const map = { [name]: samples }
    storage.set(MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V1, JSON.stringify(map))
  }
}
