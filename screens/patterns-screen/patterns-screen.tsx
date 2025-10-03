import { Loading } from '@/components/loading/loading'
import { PatternCard } from '@/components/pattern-card/pattern-card'
import { PatternDetailOverlay } from '@/components/pattern-detail-overlay/pattern-detail-overlay'
import { Text } from '@/components/ui/text'
import { upsertPatternsByGrouping } from '@/services/database/patterns-repository'
import { SMSService } from '@/services/sms-parsing/sms-service'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import type { DistinctPattern, Transaction, TransactionPattern } from '@/types/sms/transaction'
import { murmurHash32 } from '@/utils/hash/murmur32'
import { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useMMKVBoolean, useMMKVObject } from 'react-native-mmkv'
import { useStyles } from './patterns-screen.styles'

export const PatternsScreen = () => {
  const styles = useStyles()
  const [isLoading, setIsLoading] = useState(true)
  const [patterns, setPatterns] = useState<DistinctPattern[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedPattern, setSelectedPattern] = useState<DistinctPattern | null>(null)
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)

  const [isPatternDiscoveryCompleted = false, setIsPatternDiscoveryCompleted] = useMMKVBoolean(
    MMKV_KEYS.PATTERNS.IS_PATTERN_DISCOVERY_COMPLETED
  )
  const [, setSamplesByPatternId] = useMMKVObject<Record<string, Transaction[]>>(
    MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V1
  )

  useEffect(() => {
    const loadOrDiscoverPatterns = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // First-time discovery flow
        if (!isPatternDiscoveryCompleted) {
          const result: TransactionPattern = await SMSService.getDistinctSMSMessagesLastNDays(30)

          if (result.success) {
            await upsertPatternsByGrouping(result.distinctPatterns)

            const samples: Record<string, Transaction[]> = {}
            result.distinctPatterns.map((p) => {
              const key = murmurHash32(p.groupingTemplate)
              samples[key] = p.transactions.slice(0, 3)
            })

            setSamplesByPatternId(samples)
            setIsPatternDiscoveryCompleted(true)
            setPatterns(result.distinctPatterns)
          } else {
            setError(result.errors.join(', ') || 'Failed to discover patterns')
          }

          return
        }

        // Subsequent loads (temporary: still derive patterns until DB upsert is in place)
        const result: TransactionPattern = await SMSService.getDistinctSMSMessagesLastNDays(30)
        if (result.success) {
          setPatterns(result.distinctPatterns)
        } else {
          setError(result.errors.join(', ') || 'Failed to load patterns')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrDiscoverPatterns()
  }, [isPatternDiscoveryCompleted, setIsPatternDiscoveryCompleted, setSamplesByPatternId])

  const handleReviewPattern = (patternId: string) => {
    const pattern = patterns.find((p) => p.id === patternId)
    if (pattern) {
      setSelectedPattern(pattern)
      setIsOverlayVisible(true)
    }
  }

  const handleCloseOverlay = () => {
    setIsOverlayVisible(false)
    setSelectedPattern(null)
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
        {patterns.map((pattern) => (
          <PatternCard
            key={pattern.id}
            template={pattern.template}
            similarCount={pattern.occurrences}
            status={pattern.status}
            onReview={() => handleReviewPattern(pattern.id)}
          />
        ))}
      </ScrollView>

      <PatternDetailOverlay
        pattern={selectedPattern}
        isVisible={isOverlayVisible}
        onClose={handleCloseOverlay}
      />
    </>
  )
}
