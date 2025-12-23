import { ChecklistItem } from '@/components/checklist-item/checklist-item'
import { SuccessState } from '@/components/success-state/success-state'
import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import { EXPENSE_TOUR_THRESHOLD, PATTERN_TOUR_THRESHOLD } from '@/constants/tour'
import { useGettingStarted } from '@/hooks/use-getting-started'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import { storage } from '@/utils/mmkv/storage'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styles } from './getting-started.style'

export function GettingStartedScreen() {
  const router = useRouter()
  const { allTasksCompleted, patternStatus, patternProgress, expenseStatus, expenseProgress } = useGettingStarted()

  const [showCongratulations, setShowCongratulations] = useState(false)
  const hasShownCongratulations = useRef(false)

  const completeOnboarding = () => {
    storage.set(MMKV_KEYS.APP.GETTING_STARTED_SEEN, true)
    router.replace('/(tabs)')
  }

  useEffect(() => {
    if (allTasksCompleted && !hasShownCongratulations.current) {
      hasShownCongratulations.current = true
      setShowCongratulations(true)
    }
  }, [allTasksCompleted])

  if (showCongratulations) {
    return (
      <SuccessState
        title='All done!'
        description='You are ready to start tracking your finances.'
        onAnimationFinish={completeOnboarding}
      />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant='h3'>Getting Started</Text>
        <Text
          variant='pMd'
          color='muted'
        >
          Complete these to master your finances.
        </Text>
      </View>

      <View style={styles.checklistContainer}>
        <ChecklistItem
          title={`Review ${PATTERN_TOUR_THRESHOLD} patterns`}
          status={patternStatus}
          progress={patternProgress}
          onPress={() => router.push('/(shared)/patterns')}
        />
        <ChecklistItem
          title={`Add ${EXPENSE_TOUR_THRESHOLD} expenses`}
          status={expenseStatus}
          progress={expenseProgress}
          onPress={() => router.push('/(shared)/add-expense')}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          type='outline'
          title='Skip tour'
          onPress={completeOnboarding}
        />
      </View>
    </SafeAreaView>
  )
}
