import { Button } from '@/components/ui/button/button'
import { Card } from '@/components/ui/card/card'
import { SmsReviewItem } from '@/components/ui/sms-review-item/sms-review-item'
import { finalizeReview, reviewNext, reviewPrev, reviewReset, reviewUpdateItem } from '@/hooks/use-store'
import type { Transaction } from '@/types/sms/transaction'
import { useRouter } from 'expo-router'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
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
      reviewReset()
      router.back()
    })
  }

  return (
    <>
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
    </>
  )
}
