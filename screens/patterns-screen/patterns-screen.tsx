import { Loading } from '@/components/loading/loading'
import { PatternCard } from '@/components/pattern-card/pattern-card'
import { PatternDetailOverlay } from '@/components/pattern-detail-overlay/pattern-detail-overlay'
import { Text } from '@/components/ui/text'
import { SMSService } from '@/services/sms-parsing/sms-service'
import type { DistinctPattern, TransactionPattern } from '@/types/sms/transaction'
import { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useStyles } from './patterns-screen.styles'

export const PatternsScreen = () => {
  const styles = useStyles()
  const [isLoading, setIsLoading] = useState(true)
  const [patterns, setPatterns] = useState<DistinctPattern[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedPattern, setSelectedPattern] = useState<DistinctPattern | null>(null)
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)

  useEffect(() => {
    const loadPatterns = async () => {
      try {
        setIsLoading(true)
        setError(null)

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

    loadPatterns()
  }, [])

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
            sampleSms={pattern.sampleSMS}
            similarCount={pattern.occurrences}
            status={pattern.confidence > 0.8 ? 'approved' : 'action_needed'}
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
