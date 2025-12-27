import { Button } from '@/components/ui/button/button'
import { Input } from '@/components/ui/input/input'
import { Text } from '@/components/ui/text/text'
import { Expense } from '@/types/expense'
import { formatDateTime } from '@/utils/date/format-date-time'
import { IndianRupee, MessageSquare, Store, Tag } from 'lucide-react-native'
import React from 'react'
import { ScrollView, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './edit-expense-content.styles'

interface EditExpenseContentProps {
  expense: Expense
  amount: string
  merchantName: string
  categoryName: string
  onAmountChange: (value: string) => void
  onMerchantChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onDelete: () => void
  onSave: () => void
  isSaving: boolean
}

export function EditExpenseContent({
  expense,
  amount,
  merchantName,
  categoryName,
  onAmountChange,
  onMerchantChange,
  onCategoryChange,
  onDelete,
  onSave,
  isSaving,
}: EditExpenseContentProps) {
  const { theme } = useUnistyles()

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text
        variant='h4'
        style={styles.title}
      >
        Edit Expense
      </Text>

      {expense.smsBody && (
        <View style={styles.smsSection}>
          <View style={styles.smsHeader}>
            <View style={styles.smsIconContainer}>
              <MessageSquare
                size={14}
                color={theme.colors.surface}
              />
            </View>
            <View style={styles.smsMeta}>
              <Text variant='pSmBold'>{expense.smsSender}</Text>
              <Text
                variant='pSm'
                color='muted'
              >
                {formatDateTime(expense.receivedAt)}
              </Text>
            </View>
          </View>
          <ScrollView
            style={styles.smsBodyScroll}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <Text
              variant='pSm'
              color='muted'
              style={styles.smsBody}
              selectable
            >
              {expense.smsBody}
            </Text>
          </ScrollView>
        </View>
      )}

      <Input
        testID='merchant-input'
        label='Merchant'
        placeholder='Enter merchant name'
        value={merchantName}
        onChangeText={onMerchantChange}
        leftContent={
          <Store
            size={16}
            color={theme.colors.primary}
          />
        }
      />

      <Input
        testID='category-input'
        label='Category'
        placeholder='Enter category'
        value={categoryName}
        onChangeText={onCategoryChange}
        leftContent={
          <Tag
            size={16}
            color={theme.colors.primary}
          />
        }
      />

      <Input
        testID='amount-input'
        label='Amount'
        placeholder='Enter amount'
        value={amount}
        onChangeText={onAmountChange}
        keyboardType='decimal-pad'
        leftContent={
          <IndianRupee
            size={16}
            color={theme.colors.primary}
          />
        }
      />

      <View style={styles.buttons}>
        <Button
          title='Delete'
          type='destructive'
          onPress={onDelete}
          containerStyle={styles.button}
        />
        <Button
          title='Save'
          onPress={onSave}
          isLoading={isSaving}
          containerStyle={styles.button}
        />
      </View>
    </KeyboardAwareScrollView>
  )
}
