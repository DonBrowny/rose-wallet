import { Loading } from '@/components/loading/loading'
import { PatternCard } from '@/components/pattern-card/pattern-card'
import { Text } from '@/components/ui/text/text'
import { useLivePatterns } from '@/hooks/use-live-patterns'
import { upsertPatternsByGrouping } from '@/services/database/patterns-repository'
import { SMSService } from '@/services/sms-parsing/sms-service'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import type { DistinctPattern, Transaction, TransactionPattern } from '@/types/sms/transaction'
import { murmurHash32 } from '@/utils/hash/murmur32'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useMMKVBoolean, useMMKVObject } from 'react-native-mmkv'
import { styles } from './patterns-screen.styles'

export const PatternsScreen = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [patterns, setPatterns] = useState<DistinctPattern[]>([])
  const [error, setError] = useState<string | null>(null)
  const live = useLivePatterns()

  const [isPatternDiscoveryCompleted = false, setIsPatternDiscoveryCompleted] = useMMKVBoolean(
    MMKV_KEYS.PATTERNS.IS_PATTERN_DISCOVERY_COMPLETED
  )
  const [, setSamplesByPatternId] = useMMKVObject<Record<string, Transaction[]>>(
    MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V1
  )

  const DAYS_TO_ANALYZE = 30
  const router = useRouter()

  useEffect(() => {
    const loadOrDiscoverPatterns = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // First-time discovery flow
        if (!isPatternDiscoveryCompleted) {
          const result: TransactionPattern = await SMSService.getDistinctSMSMessagesLastNDays(DAYS_TO_ANALYZE)

          if (result.success) {
            await upsertPatternsByGrouping(result.distinctPatterns)

            const samples: Record<string, Transaction[]> = {}
            result.distinctPatterns.map((p) => {
              const key = murmurHash32(p.groupingTemplate)
              samples[key] = p.transactions.slice(0, 3)
            })

            setSamplesByPatternId(samples)
            setPatterns(result.distinctPatterns)
            setIsPatternDiscoveryCompleted(true)
          } else {
            setError(result.errors.join(', ') || 'Failed to discover patterns')
          }

          return
        }
        // Subsequent loads: rely on live query at render
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrDiscoverPatterns()
  }, [isPatternDiscoveryCompleted, setIsPatternDiscoveryCompleted, setSamplesByPatternId])

  const displayedPatterns: DistinctPattern[] = live.data.length > 0 ? live.data : patterns

  const handleReviewPattern = (patternId: string) => {
    router.push({ pathname: '/(shared)/pattern-review', params: { patternId } })
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loading
          title='Learning Patterns'
          description='Rosie is analyzing your SMS messages to understand patterns...'
        />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text variant='h3'>Error Loading Patterns</Text>
        <Text
          variant='pSm'
          color='muted'
        >
          {error}
        </Text>
      </View>
    )
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.patternsListContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {displayedPatterns.map((pattern) => (
          <PatternCard
            key={pattern.id}
            template={pattern.template}
            status={pattern.status}
            onReview={() => handleReviewPattern(pattern.id)}
          />
        ))}
      </ScrollView>
    </>
  )
}
