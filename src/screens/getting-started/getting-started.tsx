import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import { useGetPatterns } from '@/hooks/use-get-patterns'
import { useGetTransactionCount } from '@/hooks/use-get-transaction-count'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import { PatternStatus } from '@/types/patterns/enums'
import { storage } from '@/utils/mmkv/storage'
import { useRouter } from 'expo-router'
import LottieView from 'lottie-react-native'
import { CheckCircle2, Clock, Lock } from 'lucide-react-native'
import { useEffect, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './getting-started.style'

const PATTERN_TOUR_THRESHOLD = 2
const EXPENSE_TOUR_THRESHOLD = 2

export function GettingStartedScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const lastSeenDate = storage.getString(MMKV_KEYS.APP.GETTING_STARTED_SEEN_AT)

  const { data: patterns, isLoading: isPatternsLoading } = useGetPatterns({
    filter: { startDate: lastSeenDate ? new Date(parseInt(lastSeenDate, 10)) : undefined },
  })
  const { data: transactionCount = 0, isLoading: isTransactionsLoading } = useGetTransactionCount()

  const reviewedCount = useMemo(() => {
    if (!patterns) return 0
    return patterns.filter((p) => p.status !== PatternStatus.NeedsReview).length
  }, [patterns])
  const patternTourDone = reviewedCount >= PATTERN_TOUR_THRESHOLD

  const canStartExpenseTour = patternTourDone
  const expenseTourDone = transactionCount >= EXPENSE_TOUR_THRESHOLD
  const allTasksCompleted = patternTourDone && expenseTourDone

  const [showCongratulations, setShowCongratulations] = useState(false)
  const hasShownCongratulations = useRef(false)

  const skipPressHandler = () => {
    storage.set(MMKV_KEYS.APP.GETTING_STARTED_SEEN, 'true')
    router.replace('/(tabs)')
  }

  useEffect(() => {
    if (allTasksCompleted && !hasShownCongratulations.current) {
      hasShownCongratulations.current = true
      setShowCongratulations(true)
    }
  }, [allTasksCompleted])

  function handleAnimationFinish() {
    storage.set(MMKV_KEYS.APP.GETTING_STARTED_SEEN, 'true')
    router.replace('/(tabs)')
  }

  if (showCongratulations) {
    return (
      <SafeAreaView style={styles.congratulationsContainer}>
        <LottieView
          source={require('@/assets/animations/congratulations.json')}
          autoPlay
          loop={false}
          style={styles.lottieAnimation}
          resizeMode='contain'
          onAnimationFinish={handleAnimationFinish}
        />
        <Text
          variant='h3'
          style={styles.congratulationsText}
        >
          All done!
        </Text>
        <Text
          variant='pMd'
          color='muted'
          style={styles.congratulationsText}
        >
          You are ready to start tracking your finances.
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text variant='h3'>Getting Started</Text>
      <Text
        variant='pMd'
        color='muted'
      >
        Two short tours to master your finances.
      </Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text variant='pLgBold'>Learn to review a pattern</Text>
          <View style={[styles.pill, patternTourDone ? styles.pillDone : styles.pillPending]}>
            {patternTourDone ? (
              <CheckCircle2
                size={14}
                color={theme.colors.background}
              />
            ) : (
              <Clock
                size={14}
                color={theme.colors.background}
              />
            )}
            <Text
              variant='pMd'
              style={styles.pillText}
            >
              {patternTourDone ? 'Completed' : 'Not started'}
            </Text>
          </View>
        </View>
        <Text variant='pMd'>Approve and categorize bank SMS quickly.</Text>
        <Button
          title={patternTourDone ? 'View again' : 'Start tour'}
          onPress={() => router.push('/(shared)/patterns')}
          containerStyle={styles.button}
        />
        {!isPatternsLoading && reviewedCount < PATTERN_TOUR_THRESHOLD ? (
          <Text
            variant='pSm'
            color='muted'
          >
            Review at least {PATTERN_TOUR_THRESHOLD} patterns: Currently you have {reviewedCount}/
            {PATTERN_TOUR_THRESHOLD} reviewed.
          </Text>
        ) : null}
      </View>

      <View style={[styles.card, !canStartExpenseTour && styles.cardLocked]}>
        <View style={styles.cardHeader}>
          <Text variant='pLgBold'>Learn to add an expense</Text>
          <View
            style={[
              styles.pill,
              expenseTourDone ? styles.pillDone : canStartExpenseTour ? styles.pillPending : styles.pillLocked,
            ]}
          >
            {expenseTourDone ? (
              <CheckCircle2
                size={14}
                color={theme.colors.background}
              />
            ) : canStartExpenseTour ? (
              <Clock
                size={14}
                color={theme.colors.background}
              />
            ) : (
              <Lock
                size={14}
                color={theme.colors.background}
              />
            )}
            <Text style={styles.pillText}>
              {expenseTourDone ? 'Completed' : canStartExpenseTour ? 'Not started' : 'Locked'}
            </Text>
          </View>
        </View>
        <Text variant='pMd'>Add a manual expense in a few taps.</Text>
        {!canStartExpenseTour && (
          <Text
            variant='pSm'
            color='muted'
          >
            Finish the pattern review tour to unlock.
          </Text>
        )}
        {canStartExpenseTour && !isTransactionsLoading && transactionCount < EXPENSE_TOUR_THRESHOLD ? (
          <Text
            variant='pSm'
            color='muted'
          >
            Add at least {EXPENSE_TOUR_THRESHOLD} transactions: Currently you have {transactionCount}/
            {EXPENSE_TOUR_THRESHOLD} added.
          </Text>
        ) : null}
        <Button
          containerStyle={styles.button}
          title={expenseTourDone ? 'View again' : 'Start tour'}
          onPress={() => router.push('/(shared)/add-expense')}
          disabled={!canStartExpenseTour}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          containerStyle={styles.button}
          title='Skip tour'
          onPress={skipPressHandler}
        />
      </View>
    </SafeAreaView>
  )
}
