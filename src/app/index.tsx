import { MMKV_KEYS } from '@/types/mmkv-keys'
import { storage } from '@/utils/mmkv/storage'
import { Redirect } from 'expo-router'

export default function IndexRedirect() {
  const isOnboardingCompleted = storage.getBoolean(MMKV_KEYS.APP.ONBOARDING_COMPLETED)
  const hasSeenGettingStarted = storage.getBoolean(MMKV_KEYS.APP.GETTING_STARTED_SEEN)

  if (!isOnboardingCompleted) {
    return <Redirect href='/onboarding' />
  }
  if (!hasSeenGettingStarted) {
    return <Redirect href='/getting-started' />
  }
  return <Redirect href='/(tabs)' />
}
