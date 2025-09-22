import { Loading } from '@/components/loading/loading'
import { PatternCard } from '@/components/pattern-card/pattern-card'
import { Text } from '@/components/ui/text'
import { SMSService } from '@/services/sms-parsing/sms-service'
import type { DistinctPattern, TransactionPattern } from '@/types/sms/transaction'
import { useEffect, useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import { useStyles } from './patterns-screen.styles'

export const PatternsScreen = () => {
  const styles = useStyles()
  const [isLoading, setIsLoading] = useState(true)
  const [patterns, setPatterns] = useState<DistinctPattern[]>([])
  const [error, setError] = useState<string | null>(null)

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
    Alert.alert('Review Pattern', `Reviewing pattern ${patternId}. This would open the pattern review screen.`, [
      { text: 'OK' },
    ])
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
  )
}
