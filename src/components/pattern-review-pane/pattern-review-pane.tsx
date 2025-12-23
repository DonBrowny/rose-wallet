import { SmsReviewItem } from '@/components/sms-review-item/sms-review-item'
import { Button } from '@/components/ui/button/button'
import { Card } from '@/components/ui/card/card'
import { GETTING_STARTED_PATTERNS_QUERY_KEY } from '@/hooks/use-getting-started'
import { finalizeReview, reviewNext, reviewPrev, reviewReset, reviewUpdateItem } from '@/hooks/use-store'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import type { Transaction } from '@/types/sms/transaction'
import { useQueryClient } from '@tanstack/react-query'
import { useTourGuide } from '@wrack/react-native-tour-guide'
import { useRouter } from 'expo-router'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react-native'
import React, { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './pattern-review-pane.styes'

interface Props {
  sample: Transaction | undefined
  index: number
  total: number
}

export function PatternReviewPane({ sample, index, total }: Props) {
  const { theme } = useUnistyles()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { startTour } = useTourGuide()
  const buttonRef = useRef(null)
  const viewRef = useRef(null)
  const [reviewGuideSeen = false, setReviewGuideSeen] = useMMKVBoolean(MMKV_KEYS.PATTERNS.REVIEW_GUIDE_SEEN)
  const showTour = !reviewGuideSeen

  useEffect(() => {
    if (!showTour) return
    const timer = setTimeout(() => {
      startTour([
        {
          id: 'step1',
          targetRef: viewRef,
          title: 'Review this SMS',
          description: "Check the detected Amount and Merchant. Edit them if they don't look right.",
          tooltipPosition: 'bottom',
          spotlightShape: 'rectangle',
        },
        {
          id: 'step2',
          targetRef: buttonRef,
          title: 'Next sample',
          description:
            'Tap Next to review the following SMS for this pattern. On the last one, press Approve to finish.',
          tooltipPosition: 'bottom',
          spotlightShape: 'rectangle',
          onNext: () => {
            setReviewGuideSeen(true)
          },
        },
      ])
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on first render
  }, [showTour])

  const isFirst = index === 0
  const isLast = index === total - 1

  const [amountValue, setAmountValue] = useState(sample ? String(sample.amount) : '')
  const [merchantValue, setMerchantValue] = useState(sample?.merchant ?? '')

  // Sync local state when sample changes
  useEffect(() => {
    if (!sample) return
    setAmountValue(String(sample.amount))
    setMerchantValue(sample.merchant)
  }, [sample])

  if (!sample) return null

  const persist = () => {
    const parsed = parseFloat(amountValue)
    const amount = isNaN(parsed) ? sample.amount : parsed
    reviewUpdateItem(index, { amount, merchant: merchantValue })
  }

  const handleNextOrApprove = () => {
    persist()
    if (isLast) {
      handleApprove()
    } else {
      reviewNext()
    }
  }
  const handlePrev = () => {
    persist()
    reviewPrev()
  }

  const handleApprove = () => {
    persist()
    finalizeReview().finally(() => {
      queryClient.invalidateQueries({ queryKey: [GETTING_STARTED_PATTERNS_QUERY_KEY] })
      reviewReset()
      router.back()
    })
  }

  return (
    <>
      <View ref={viewRef}>
        <Card>
          <SmsReviewItem
            id={sample.message.id}
            bankName={sample.bankName}
            date={sample.message.date}
            messageBody={sample.message.body}
            merchant={sample.merchant}
            amount={sample.amount}
            amountValue={amountValue}
            merchantValue={merchantValue}
            onChangeAmount={setAmountValue}
            onChangeMerchant={setMerchantValue}
          />
        </Card>
      </View>
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
        <View ref={buttonRef}>
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
      </View>
    </>
  )
}
