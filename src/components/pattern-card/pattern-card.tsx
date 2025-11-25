import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import { type DistinctPattern } from '@/types/sms/transaction'
import { AlertCircle, CheckCircle } from 'lucide-react-native'
import { View } from 'react-native'
import { AttachStep } from 'react-native-spotlight-tour'
import { styles } from './pattern-card.styles'

interface PatternCardProps extends Pick<DistinctPattern, 'status' | 'template'> {
  onReview: () => void
  attachInfoIndex?: number
  attachButtonIndex?: number
}

export const PatternCard = ({ template, status, onReview, attachInfoIndex, attachButtonIndex }: PatternCardProps) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.statusContainer}>
        <View style={styles.statusPill(status)}>
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
      </View>

      {typeof attachInfoIndex === 'number' ? (
        <AttachStep index={attachInfoIndex}>
          <View
            collapsable={false}
            style={{ alignSelf: 'flex-start' }}
          >
            <Text variant='pMd'>{template}</Text>
          </View>
        </AttachStep>
      ) : (
        <Text variant='pMd'>{template}</Text>
      )}

      <View style={styles.footer}>
        <Button
          title='Reject'
          type='destructive'
          //TODO: Wire-up the reject action
        />
        {typeof attachButtonIndex === 'number' ? (
          <AttachStep index={attachButtonIndex}>
            <View
              collapsable={false}
              style={{ alignSelf: 'flex-start' }}
            >
              <Button
                title='Review Pattern'
                type='outline'
                onPress={onReview}
              />
            </View>
          </AttachStep>
        ) : (
          <Button
            title='Review Pattern'
            type='outline'
            onPress={onReview}
          />
        )}
      </View>
    </View>
  )
}
