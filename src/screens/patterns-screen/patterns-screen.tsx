import { Loading } from '@/components/loading/loading'
import { PatternCard } from '@/components/pattern-card/pattern-card'
import { Text } from '@/components/ui/text/text'
import { GETTING_STARTED_PATTERNS_QUERY_KEY } from '@/hooks/use-getting-started'
import { useLivePatterns } from '@/hooks/use-live-patterns'
import { updatePatternStatusById } from '@/services/database/patterns-repository'
import { PatternDiscoveryService } from '@/services/sms-parsing/pattern-discovery-service'
import { PATTERN_STATUS } from '@/db/schema'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'
import { styles } from './patterns-screen.styles'

export const PatternsScreen = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data } = useLivePatterns()
  const queryClient = useQueryClient()

  const [isPatternDiscoveryCompleted = false, setIsPatternDiscoveryCompleted] = useMMKVBoolean(
    MMKV_KEYS.PATTERNS.IS_PATTERN_DISCOVERY_COMPLETED
  )

  const DAYS_TO_ANALYZE = 60
  const router = useRouter()

  useEffect(() => {
    const loadOrDiscoverPatterns = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // First-time discovery flow; subsequent loads rely on the live query at render
        if (!isPatternDiscoveryCompleted) {
          await PatternDiscoveryService.discoverFromLastNDays(DAYS_TO_ANALYZE)
          setIsPatternDiscoveryCompleted(true)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrDiscoverPatterns()
  }, [isPatternDiscoveryCompleted, setIsPatternDiscoveryCompleted])

  const handleReviewPattern = (patternId: string) => {
    router.push({ pathname: '/(shared)/pattern-review', params: { patternId } })
  }

  const handleRejectPattern = async (patternId: string) => {
    await updatePatternStatusById(Number(patternId), PATTERN_STATUS.Rejected)
    queryClient.invalidateQueries({ queryKey: [GETTING_STARTED_PATTERNS_QUERY_KEY] })
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.patternsListContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
      alwaysBounceVertical={false}
    >
      {data.map((pattern, idx) => (
        <PatternCard
          key={pattern.id}
          template={pattern.template}
          status={pattern.status}
          onReview={() => handleReviewPattern(pattern.id)}
          onReject={() => handleRejectPattern(pattern.id)}
          isFirstCard={idx === 0}
        />
      ))}
    </ScrollView>
  )
}
