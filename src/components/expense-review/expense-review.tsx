import { QuickCategoryChips } from '@/components/quick-category-chips/quick-category-chips'
import { Input } from '@/components/ui/input/input'
import { Text } from '@/components/ui/text/text'
import { Category } from '@/db/schema'
import type { Transaction } from '@/types/sms/transaction'
import { formatDateTime } from '@/utils/date/format-date-time'
import { formatCurrency } from '@/utils/formatter/format-currency'
import { MessageSquare, Store, Tag } from 'lucide-react-native'
import React from 'react'
import { View, type ViewStyle } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
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
  favoriteCategories?: Category[]
  isFavoriteCategoriesLoading?: boolean
  onEditCategories?: () => void
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
  favoriteCategories = [],
  isFavoriteCategoriesLoading = false,
  onEditCategories,
}: Props) {
  const { theme } = useUnistyles()

  return (
    <View style={[styles.container, style]}>
      <View style={styles.amountSection}>
        <Text
          variant='aLgBold'
          style={styles.amount}
        >
          {formatCurrency(transaction.amount)}
        </Text>
        {transaction.merchant && (
          <View style={styles.merchantDetected}>
            <Store
              size={14}
              color={theme.colors.surface}
              opacity={0.8}
            />
            <Text
              variant='pSm'
              style={styles.merchantText}
            >
              {transaction.merchant}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.smsSection}>
        <View style={styles.smsHeader}>
          <View style={styles.smsIconContainer}>
            <MessageSquare
              size={18}
              color={theme.colors.onSurface}
            />
          </View>
          <View style={styles.smsMeta}>
            <Text variant='pMdBold'>{transaction.message.address}</Text>
            <Text
              variant='pSm'
              color='muted'
            >
              {formatDateTime(new Date(transaction.message.date))}
            </Text>
          </View>
        </View>
        <Text
          variant='pMd'
          style={styles.smsBody}
          selectable
        >
          {transaction.message.body}
        </Text>
      </View>

      <View style={styles.inputsSection}>
        <Input
          label='Merchant'
          value={merchantValue}
          onChangeText={onChangeMerchant}
          leftContent={
            <Store
              size={18}
              color={theme.colors.textMuted}
            />
          }
        />
        {onEditCategories && (
          <QuickCategoryChips
            categories={favoriteCategories}
            selectedCategory={categoryValue}
            onSelectCategory={onChangeCategory}
            onEditPress={onEditCategories}
            isLoading={isFavoriteCategoriesLoading}
          />
        )}
        <View style={styles.inputRow}>
          <Input
            label='Category'
            value={categoryValue}
            onChangeText={onChangeCategory}
            placeholder='e.g., Food'
            containerStyle={styles.inputHalf}
            leftContent={
              <Tag
                size={18}
                color={theme.colors.textMuted}
              />
            }
          />
          <Input
            label='Amount'
            value={amountValue}
            onChangeText={onChangeAmount}
            keyboardType='decimal-pad'
            inputMode='numeric'
            containerStyle={styles.inputHalf}
          />
        </View>
      </View>
    </View>
  )
}
