import { MMKV_KEYS } from '@/types/mmkv-keys'
import { storage } from '@/utils/mmkv/storage'
import { Redirect } from 'expo-router'

export default function IndexRedirect() {
  const isOnboardingCompleted = storage.getString(MMKV_KEYS.APP.ONBOARDING_COMPLETED) === 'true'
  return <Redirect href={isOnboardingCompleted ? '/(tabs)' : '/onboarding'} />
}
