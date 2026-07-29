import { MMKV_KEYS } from '@/types/mmkv-keys'
import type { ReviewTxn } from '@/types/sms-parsing'
import { storage } from './storage'

export function getPatternSamplesByName(name: string): ReviewTxn[] {
  const json = storage.getString(MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V2)
  if (!json) return []
  try {
    const map = JSON.parse(json) as Record<string, ReviewTxn[]>
    return map[name] || []
  } catch {
    return []
  }
}

export function setPatternSamplesByName(name: string, samples: ReviewTxn[]) {
  const json = storage.getString(MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V2)
  if (!json) {
    const map = { [name]: samples }
    storage.set(MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V2, JSON.stringify(map))
    return
  }
  try {
    const map = JSON.parse(json) as Record<string, ReviewTxn[]>
    const newMap = { ...map, [name]: samples }
    storage.set(MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V2, JSON.stringify(newMap))
  } catch {
    const map = { [name]: samples }
    storage.set(MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V2, JSON.stringify(map))
  }
}

export function deletePatternSamplesByName(name: string): void {
  const json = storage.getString(MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V2)
  if (!json) return
  try {
    const map = JSON.parse(json) as Record<string, ReviewTxn[]>
    if (!(name in map)) return
    delete map[name]
    storage.set(MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V2, JSON.stringify(map))
  } catch {
    // Corrupt map — nothing to delete safely.
  }
}
