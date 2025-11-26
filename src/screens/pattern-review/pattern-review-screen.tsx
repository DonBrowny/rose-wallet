import { PatternReviewPane } from '@/components/pattern-review-pane/pattern-review-pane'
import { Button } from '@/components/ui/button/button'
import { ProgressStepper } from '@/components/ui/progress-stepper/progress-stepper'
import { Text } from '@/components/ui/text/text'
import { reviewReset, useAppStore } from '@/hooks/use-store'
import { useRouter } from 'expo-router'
import { X } from 'lucide-react-native'
import { useCallback } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './pattern-review-screen.styles'

export function PatternReviewScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const samples = useAppStore.use.patternReview().transactions

  const currentIndex = useAppStore.use.patternReview().currentIndex
  const total = samples.length
  const current = samples[currentIndex]

  const handleClose = useCallback(() => {
    reviewReset()
    router.back()
  }, [router])

  if (total === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text variant='pMd'>No samples found for this pattern.</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text variant='h3'>Pattern review</Text>
          <Text
            variant='pSm'
            color='muted'
          >
            Review sample SMS for this pattern.
          </Text>
        </View>
        <Button
          testID='close-btn'
          accessibilityRole='button'
          onPress={handleClose}
          type='outline'
          hitSlop={8}
          size='icon-sm'
          leftIcon={
            <X
              color={theme.colors.primary}
              size={20}
            />
          }
        />
      </View>
      {total > 1 ? (
        <ProgressStepper
          total={total}
          currentIndex={currentIndex}
        />
      ) : null}

      <PatternReviewPane
        sample={current}
        index={currentIndex}
        total={total}
        showTour={true}
      />
    </SafeAreaView>
  )
}
