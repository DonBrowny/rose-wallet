import { HighlightedSMS } from '@/components/sms-review-item/highlighted-sms/highlighted-sms'
import { Input } from '@/components/ui/input/input'
import { Text } from '@/components/ui/text/text'
import React from 'react'
import { View } from 'react-native'
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated'
import { styles } from './sms-review-item.styles'

interface SmsReviewItemProps {
  id: string
  bankName: string
  date: number
  messageBody: string
  merchant: string
  amount: number
  amountValue: string
  merchantValue: string
  onChangeAmount: (text: string) => void
  onChangeMerchant: (text: string) => void
}

export function SmsReviewItem({
  id,
  bankName,
  date,
  messageBody,
  merchant,
  amount,
  amountValue,
  merchantValue,
  onChangeAmount,
  onChangeMerchant,
}: SmsReviewItemProps) {
  return (
    <Animated.View
      key={id}
      entering={FadeInUp.duration(300)}
      exiting={FadeOutDown.duration(300)}
      style={styles.container}
    >
      <View style={styles.headerRow}>
        <View style={styles.bankRow}>
          <Text
            variant='pSm'
            color='muted'
          >
            Bank:
          </Text>
          <Text
            variant='pMdBold'
            color='muted'
          >
            {' '}
            {bankName}
          </Text>
        </View>
        <Text
          variant='pSm'
          color='muted'
        >
          {new Date(date).toLocaleString()}
        </Text>
      </View>
      <HighlightedSMS
        text={messageBody}
        merchant={merchant}
        amount={amount}
      />
      <Input
        testID='amount-input'
        label='Amount'
        value={amountValue}
        onChangeText={onChangeAmount}
        keyboardType='numeric'
        inputMode='numeric'
      />
      <Input
        testID='merchant-input'
        label='Merchant'
        value={merchantValue}
        onChangeText={onChangeMerchant}
      />
    </Animated.View>
  )
}
