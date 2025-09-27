import { Text } from '@/components/ui/text'
import { Button } from '@rneui/themed'
import { AlertCircle, CheckCircle } from 'lucide-react-native'
import { View } from 'react-native'
import { useStyles } from './pattern-card.styles'

interface PatternCardProps {
  sampleSms: string
  similarCount: number
  status: 'approved' | 'action_needed'
  onReview: () => void
}

export const PatternCard = ({ sampleSms, similarCount, status, onReview }: PatternCardProps) => {
  const styles = useStyles({ status })

  return (
    <View style={styles.cardContainer}>
      <View style={styles.statusContainer}>
        <View style={styles.statusPill}>
          {status === 'approved' ? (
            <CheckCircle
              size={14}
              style={styles.statusIcon}
            />
          ) : (
            <AlertCircle
              size={14}
              style={styles.statusIcon}
            />
          )}
          <Text variant='pSm'>{status === 'approved' ? 'Approved' : 'Action Needed'}</Text>
        </View>
        <Text variant='pSm'>{similarCount} similar SMS</Text>
      </View>

      <Text variant='pMd'>{sampleSms}</Text>

      <View style={styles.footer}>
        <Button
          title='Review Pattern'
          size='sm'
          radius='xl'
          buttonStyle={styles.reviewButton}
          titleStyle={styles.reviewButtonText}
          onPress={onReview}
        />
      </View>
    </View>
  )
}
