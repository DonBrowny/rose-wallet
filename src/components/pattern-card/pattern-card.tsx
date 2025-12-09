import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import { type DistinctPattern } from '@/types/sms/transaction'
import { useTourGuide } from '@wrack/react-native-tour-guide'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react-native'
import { useEffect, useRef } from 'react'
import { View } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'
import { styles } from './pattern-card.styles'

interface PatternCardProps extends Pick<DistinctPattern, 'status' | 'template'> {
  onReview: () => void
  onReject: () => void
  isFirstCard?: boolean
}

export const PatternCard = ({ template, status, onReview, onReject, isFirstCard }: PatternCardProps) => {
  const buttonRef = useRef(null)
  const viewRef = useRef(null)
  const { startTour } = useTourGuide()
  const [patternGuideSeen = false, setPatternGuideSeen] = useMMKVBoolean(MMKV_KEYS.PATTERNS.PATTERN_GUIDE_SEEN)
  const showTour = !patternGuideSeen && isFirstCard

  useEffect(() => {
    if (!showTour) return
    const timer = setTimeout(() => {
      startTour([
        {
          id: 'step1',
          targetRef: viewRef,
          title: 'About this pattern',
          description:
            'This card groups SMS with a similar format. Use it to teach Rosie how to read them. You can visit this screen from Settings > Patterns.',
          tooltipPosition: 'bottom',
          spotlightShape: 'rectangle',
        },
        {
          id: 'step2',
          targetRef: buttonRef,
          title: 'Review Pattern',
          description: 'Tap “Review Pattern” to check a few examples and improve recognition.',
          tooltipPosition: 'bottom',
          spotlightShape: 'rectangle',
          onNext: () => {
            setPatternGuideSeen(true)
          },
        },
      ])
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on first render
  }, [showTour])

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
          ) : status === 'rejected' ? (
            <XCircle
              size={14}
              style={styles.statusIcon}
            />
          ) : (
            <AlertCircle
              size={14}
              style={styles.statusIcon}
            />
          )}
          <Text variant='pSm'>
            {status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Action Needed'}
          </Text>
        </View>
      </View>
      <Text variant='pMd'>{template}</Text>

      <View style={styles.footer}>
        <Button
          title='Reject'
          type='destructive'
          onPress={onReject}
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
