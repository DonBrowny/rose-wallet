import { Input } from '@/components/ui/input/input'
import { Text } from '@/components/ui/text/text'
import type { Transaction } from '@/types/sms/transaction'
import { formatCurrency } from '@/utils/formatter/format-currency'
import React from 'react'
import { View, type ViewStyle } from 'react-native'
import { styles } from './expense-review.style'

interface Props {
  transaction: Transaction
  style?: ViewStyle
  amountValue: string
  merchantValue: string
  categoryValue: string
  onChangeAmount: (text: string) => void
  onChangeMerchant: (text: string) => void
  onChangeCategory: (text: string) => void
}

export function ExpenseReview({
  transaction,
  style,
  amountValue,
  merchantValue,
  categoryValue,
  onChangeAmount,
  onChangeMerchant,
  onChangeCategory,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <Text
          variant='pSm'
          color='muted'
        >
          {new Date(transaction.transactionDate).toLocaleDateString()}
        </Text>
        <Text variant='aMdBold'>{formatCurrency(transaction.amount)}</Text>
      </View>
      <Text
        variant='pMd'
        numberOfLines={4}
      >
        {transaction.message.body}
      </Text>
      <View style={{ gap: 12, marginTop: 8 }}>
        <Input
          label='Amount'
          value={amountValue}
          onChangeText={onChangeAmount}
          keyboardType='decimal-pad'
          inputMode='numeric'
        />
        <Input
          label='Merchant'
          value={merchantValue}
          onChangeText={onChangeMerchant}
        />
        <Input
          label='Category'
          value={categoryValue}
          onChangeText={onChangeCategory}
          placeholder='e.g., Food, Groceries, Fuel'
        />
      </View>
    </View>
  )
}
