import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import { useLivePatterns } from '@/hooks/use-live-patterns'
import { PatternStatus } from '@/types/patterns/enums'
import { useRouter } from 'expo-router'
import { CheckCircle2, Clock, Lock } from 'lucide-react-native'
import { useMemo } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './getting-started.style'

export function GettingStartedScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const { data: patterns, isLoading } = useLivePatterns()

  const reviewedCount = useMemo(() => {
    if (!patterns) return 0
    return patterns.filter((p) => p.status !== PatternStatus.NeedsReview).length
  }, [patterns])
  const patternTourDone = reviewedCount >= 2

  const canStartExpenseTour = patternTourDone

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
        {!isLoading && reviewedCount < 2 ? (
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
          <View style={[styles.pill, canStartExpenseTour ? styles.pillPending : styles.pillLocked]}>
            {canStartExpenseTour ? (
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
            <Text style={styles.pillText}>{canStartExpenseTour ? 'Not started' : 'Locked'}</Text>
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
        <Button
          containerStyle={styles.button}
          title='Start tour'
          onPress={() => router.push('/(shared)/add-expense')}
          disabled={!canStartExpenseTour}
        />
      </View>
    </SafeAreaView>
  )
}
