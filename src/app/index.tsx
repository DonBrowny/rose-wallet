import { MMKV_KEYS } from '@/types/mmkv-keys'
import { storage } from '@/utils/mmkv/storage'
import { Redirect } from 'expo-router'

export default function IndexRedirect() {
  const isOnboardingCompleted = storage.getString(MMKV_KEYS.APP.ONBOARDING_COMPLETED) === 'true'
  const hasSeenGettingStarted = storage.getString(MMKV_KEYS.APP.GETTING_STARTED_SEEN) === 'true'

  if (!isOnboardingCompleted) {
    return <Redirect href='/onboarding' />
  }
  if (!hasSeenGettingStarted) {
    return <Redirect href='/(shared)/getting-started' />
  }
  return <Redirect href='/(tabs)' />
}
