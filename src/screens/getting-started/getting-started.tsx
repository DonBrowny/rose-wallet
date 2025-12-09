import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import { useLivePatterns } from '@/hooks/use-live-patterns'
import { useLiveTransactionCount } from '@/hooks/use-live-transaction-count'
import { PatternStatus } from '@/types/patterns/enums'
import { useRouter } from 'expo-router'
import LottieView from 'lottie-react-native'
import { CheckCircle2, Clock, Lock } from 'lucide-react-native'
import { useEffect, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './getting-started.style'

export function GettingStartedScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const { data: patterns, isLoading: isPatternsLoading } = useLivePatterns()
  const { count: transactionCount, isLoading: isTransactionsLoading } = useLiveTransactionCount()

  const reviewedCount = useMemo(() => {
    if (!patterns) return 0
    return patterns.filter((p) => p.status !== PatternStatus.NeedsReview).length
  }, [patterns])
  const patternTourDone = reviewedCount >= 2

  const canStartExpenseTour = patternTourDone
  const expenseTourDone = transactionCount >= 2
  const allTasksCompleted = patternTourDone && expenseTourDone

  const [showCongratulations, setShowCongratulations] = useState(false)
  const hasShownCongratulations = useRef(false)

  useEffect(() => {
    if (allTasksCompleted && !hasShownCongratulations.current) {
      hasShownCongratulations.current = true
      setShowCongratulations(true)
    }
  }, [allTasksCompleted])

  function handleAnimationFinish() {
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
        {!isPatternsLoading && reviewedCount < 2 ? (
          <Text
            variant='pSm'
            color='muted'
          >
            Review at-least 2 patterns: Currently you have {reviewedCount}/2 reviewed.
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
        {canStartExpenseTour && !isTransactionsLoading && transactionCount < 2 ? (
          <Text
            variant='pSm'
            color='muted'
          >
            Add at-least 2 transactions: Currently you have {transactionCount}/2 added.
          </Text>
        ) : null}
        <Button
          containerStyle={styles.button}
          title={expenseTourDone ? 'View again' : 'Start tour'}
          onPress={() => router.push('/(shared)/add-expense')}
          disabled={!canStartExpenseTour}
        />
      </View>
    </SafeAreaView>
  )
}
