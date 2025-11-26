import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import { type DistinctPattern } from '@/types/sms/transaction'
import { useTourGuide } from '@wrack/react-native-tour-guide'
import { AlertCircle, CheckCircle } from 'lucide-react-native'
import { useEffect, useRef } from 'react'
import { View } from 'react-native'
import { styles } from './pattern-card.styles'

interface PatternCardProps extends Pick<DistinctPattern, 'status' | 'template'> {
  onReview: () => void
  showTour?: boolean
}

export const PatternCard = ({ template, status, onReview, showTour }: PatternCardProps) => {
  const buttonRef = useRef(null)
  const viewRef = useRef(null)
  const { startTour } = useTourGuide()

  useEffect(() => {
    if (!showTour) return
    const timer = setTimeout(() => {
      startTour([
        {
          id: 'step1',
          targetRef: viewRef,
          title: 'Edit Patterm',
          description: 'Correct the amount and merchant to correct the pattern.',
          tooltipPosition: 'bottom',
          spotlightShape: 'rectangle',
        },
        {
          id: 'step2',
          targetRef: buttonRef,
          title: 'Next',
          description: 'Tap to view the next SMS with the same pattern.',
          tooltipPosition: 'bottom',
          spotlightShape: 'rectangle',
        },
      ])
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <View
      style={styles.cardContainer}
      ref={viewRef}
    >
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
      <Text variant='pMd'>{template}</Text>

      <View style={styles.footer}>
        <Button
          title='Reject'
          type='destructive'
          //TODO: Wire-up the reject action
        />
        {showTour ? (
          <View ref={buttonRef}>
            <Button
              title='Review Pattern'
              type='outline'
              onPress={onReview}
            />
          </View>
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
