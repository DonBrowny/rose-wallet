import { Loading } from '@/components/loading/loading'
import { PatternCard } from '@/components/pattern-card/pattern-card'
import { Text } from '@/components/ui/text/text'
import { TourTooltip } from '@/components/ui/tour-tooltip/tour-tooltip'
import { useLivePatterns } from '@/hooks/use-live-patterns'
import { upsertPatternsByGrouping } from '@/services/database/patterns-repository'
import { SMSService } from '@/services/sms-parsing/sms-service'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import type { Transaction, TransactionPattern } from '@/types/sms/transaction'
import { murmurHash32 } from '@/utils/hash/murmur32'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useMMKVBoolean, useMMKVObject } from 'react-native-mmkv'
import { SpotlightTourProvider, type TourStep } from 'react-native-spotlight-tour'
import { styles } from './patterns-screen.styles'

export const PatternsScreen = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data } = useLivePatterns()

  const [isPatternDiscoveryCompleted = false, setIsPatternDiscoveryCompleted] = useMMKVBoolean(
    MMKV_KEYS.PATTERNS.IS_PATTERN_DISCOVERY_COMPLETED
  )
  const [, setSamplesByPatternId] = useMMKVObject<Record<string, Transaction[]>>(
    MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V1
  )

  const DAYS_TO_ANALYZE = 60
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

  const steps: TourStep[] = [
    {
      render: ({ next }) => (
        <TourTooltip onNext={next}>
          <Text
            variant='pSm'
            color='surface'
          >
            A Pattern card groups similar bank SMS formats.
          </Text>
          <Text
            variant='pSm'
            color='surface'
          >{`You can refine parsing by reviewing patterns.`}</Text>
          <Text
            variant='pSm'
            color='surface'
          >{`Visit this screen via Settings → Patterns.`}</Text>
        </TourTooltip>
      ),
    },
    {
      render: ({ previous, stop }) => (
        <TourTooltip
          onPrevious={previous}
          onDone={stop}
        >
          <Text
            variant='pSm'
            color='surface'
          >
            Tap “Review Pattern” to start the review flow.
          </Text>
        </TourTooltip>
      ),
    },
  ]

  return (
    <SpotlightTourProvider
      steps={steps}
      overlayOpacity={0.28}
      overlayColor='rgba(0,0,0,0.9)'
    >
      {({ start }) => (
        <PatternsSpotlightContent
          data={data}
          onReview={handleReviewPattern}
          startTour={start}
        />
      )}
    </SpotlightTourProvider>
  )
}

interface PatternsSpotlightContentProps {
  data: ReturnType<typeof useLivePatterns>['data']
  onReview: (id: string) => void
  startTour: () => void
}

function PatternsSpotlightContent({ data, onReview, startTour }: PatternsSpotlightContentProps) {
  useEffect(() => {
    const id = setTimeout(() => startTour(), 250)
    return () => clearTimeout(id)
  }, [startTour])

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
          onReview={() => onReview(pattern.id)}
          attachInfoIndex={idx === 0 ? 0 : undefined}
          attachButtonIndex={idx === 0 ? 1 : undefined}
        />
      ))}
    </ScrollView>
  )
}
