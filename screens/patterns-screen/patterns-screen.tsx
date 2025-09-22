import { Loading } from '@/components/loading/loading'
import { PatternCard } from '@/components/pattern-card/pattern-card'
import { useEffect, useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import { useStyles } from './patterns-screen.styles'

// Sample patterns data
const samplePatterns = [
  {
    id: '1',
    sampleSms: 'Rs.500 debited from A/c **1234 on 15-Jan-24. Avl Bal: Rs.25,000',
    similarCount: 12,
    status: 'approved' as const,
  },
  {
    id: '2',
    sampleSms: 'Rs.1,200 credited to A/c **5678 on 16-Jan-24. UPI Ref: 123456789',
    similarCount: 8,
    status: 'approved' as const,
  },
  {
    id: '3',
    sampleSms: 'Rs.250 paid to MERCHANT via UPI on 17-Jan-24. UPI Ref: 987654321',
    similarCount: 3,
    status: 'action_needed' as const,
  },
  {
    id: '4',
    sampleSms: 'Your HDFC Bank A/c **9999 has been debited with Rs.1,500 on 18-Jan-24',
    similarCount: 15,
    status: 'approved' as const,
  },
  {
    id: '5',
    sampleSms: 'Rs.750 transferred to SAVINGS A/c **1111 on 19-Jan-24',
    similarCount: 1,
    status: 'action_needed' as const,
  },
  {
    id: '6',
    sampleSms: 'Rs.2,000 credited to A/c **2222 on 20-Jan-24. Salary credit',
    similarCount: 4,
    status: 'approved' as const,
  },
]

export const PatternsScreen = () => {
  const styles = useStyles()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.patternsListContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
      alwaysBounceVertical={false}
    >
      {samplePatterns.map((pattern) => (
        <PatternCard
          key={pattern.id}
          sampleSms={pattern.sampleSms}
          similarCount={pattern.similarCount}
          status={pattern.status}
          onReview={() => handleReviewPattern(pattern.id)}
        />
      ))}
    </ScrollView>
  )
}
