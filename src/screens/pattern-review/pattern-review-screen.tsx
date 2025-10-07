import { Button } from '@/components/ui/button/button'
import { Card } from '@/components/ui/card/card'
import { ProgressStepper } from '@/components/ui/progress-stepper/progress-stepper'
import { SmsReviewItem } from '@/components/ui/sms-review-item/sms-review-item'
import { Text } from '@/components/ui/text/text'
import { useAppStore } from '@/hooks/use-store'
import { useRouter } from 'expo-router'
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './pattern-review-screen.styles'

interface PatternReviewScreenProps {
  id: number
  groupingTemplate: string
  name: string
  template: string
  status: string
}

export function PatternReviewScreen({ id, groupingTemplate, name, template, status }: PatternReviewScreenProps) {
  const router = useRouter()
  const { theme } = useUnistyles()

  const samples = useAppStore.use.patternReview().transactions

  const [currentIndex, setCurrentIndex] = useState(0)
  const total = samples.length
  const isFirst = currentIndex === 0
  const isLast = total > 0 ? currentIndex === total - 1 : true
  const current = samples[currentIndex]

  const handleApprove = useCallback(async () => {
    console.log('approve')
    // await updatePatternStatusById(Number(id), 'approved')
    // router.back()
  }, [id, router])

  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  const handlePrev = useCallback(() => {
    if (isFirst) return
    setCurrentIndex((i) => Math.max(0, i - 1))
  }, [isFirst])

  const handleNextOrApprove = useCallback(() => {
    if (isLast) {
      handleApprove()
      return
    }
    setCurrentIndex((i) => Math.min(total - 1, i + 1))
  }, [isLast, total, handleApprove])

  if (total === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text variant='pMd'>No samples found for this pattern.</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text variant='h3'>Pattern review</Text>
          <Text
            variant='pSm'
            color='muted'
          >
            Review sample SMS for this pattern.
          </Text>
        </View>
        <Button
          accessibilityRole='button'
          onPress={handleClose}
          type='outline'
          hitSlop={8}
          size='icon-sm'
          leftIcon={
            <X
              color={theme.colors.primary}
              size={20}
            />
          }
        />
      </View>
      {total > 1 ? (
        <ProgressStepper
          total={total}
          currentIndex={currentIndex}
        />
      ) : null}

      <Card style={styles.content}>
        <SmsReviewItem
          id={current.message.id}
          bankName={current.bankName}
          date={current.message.date}
          messageBody={current.message.body}
          merchant={current.merchant}
          amount={current.amount}
        />
      </Card>

      <View style={styles.footer}>
        <Button
          type='outline'
          onPress={handlePrev}
          disabled={isFirst || total === 0}
          leftIcon={
            <ChevronLeft
              color={theme.colors.primary}
              size={20}
            />
          }
          title='Back'
        />
        <Button
          onPress={handleNextOrApprove}
          disabled={total === 0}
          rightIcon={
            isLast ? (
              <Check
                color={theme.colors.surface}
                size={20}
              />
            ) : (
              <ChevronRight
                color={theme.colors.surface}
                size={20}
              />
            )
          }
          title={isLast ? 'Approve' : 'Next'}
        />
      </View>
    </SafeAreaView>
  )
}
