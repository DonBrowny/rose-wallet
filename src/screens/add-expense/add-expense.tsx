import { ExpenseReview } from '@/components/expense-review/expense-review'
import { Loading } from '@/components/loading/loading'
import { SuccessState } from '@/components/success-state/success-state'
import { IconButton } from '@/components/ui/icon-button/icon-button'
import { Text } from '@/components/ui/text/text'
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus'
import { useSaveExpense } from '@/hooks/use-save-expense'
import { useSMSTransactions } from '@/hooks/use-sms-transactions'
import { updateLastReadSmsTimestamp } from '@/utils/mmkv/storage'
import { useRouter } from 'expo-router'
import { Check, MessageSquareText, X } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './add-expense.style'

export default function AddExpenseScreen() {
  const { theme } = useUnistyles()
  const router = useRouter()
  const { data: transactions = [], isLoading, isFetching, errorMessage, refetch } = useSMSTransactions()
  const { mutate: saveExpense, isPending: isSaving } = useSaveExpense()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [amountValue, setAmountValue] = useState('')
  const [merchantValue, setMerchantValue] = useState('')

  const [categoryValue, setCategoryValue] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)

  useRefetchOnFocus(refetch)

  const isLastItem = currentIndex >= transactions.length - 1

  // Prefill inputs when the current item changes
  useEffect(() => {
    const tx = transactions[currentIndex]
    if (!tx) return
    setAmountValue(String(tx.amount ?? ''))
    setMerchantValue(tx.merchant ?? '')
    setCategoryValue('')
  }, [transactions, currentIndex])

  function handleReject() {
    const tx = transactions[currentIndex]
    if (tx) {
      updateLastReadSmsTimestamp(tx.transactionDate)
    }

    if (isLastItem) {
      setIsCompleted(true)
      return
    }
    setCurrentIndex(currentIndex + 1)
  }

  function handleConfirm() {
    const tx = transactions[currentIndex]
    if (!tx) return

    saveExpense(
      {
        transaction: tx,
        amount: Number(amountValue),
        merchantName: merchantValue,
        categoryName: categoryValue,
      },
      {
        onSuccess: () => {
          if (isLastItem) {
            setIsCompleted(true)
            return
          }
          setCurrentIndex(currentIndex + 1)
        },
        onError: (e) => {
          console.warn('Confirm expense failed', e)
        },
      }
    )
  }

  function handleGoBack() {
    router.back()
  }

  if (isLoading || isFetching) {
    return (
      <View style={styles.centeredContainer}>
        <Loading
          title='Reading Messages'
          description='Rosie is analyzing your SMS messages to find expenses...'
        />
      </View>
    )
  }

  if (errorMessage) {
    return (
      <View style={styles.centeredContainer}>
        <Text
          variant='pMd'
          color='muted'
        >
          {errorMessage}
        </Text>
      </View>
    )
  }

  if (isCompleted || transactions.length === 0) {
    const title = isCompleted ? 'All Done! 👍' : 'All Caught Up!'
    const description = isCompleted ? undefined : 'No new expenses to review. Check back later!'

    return (
      <SuccessState
        title={title}
        description={description}
        buttonTitle='Go Back'
        onButtonPress={handleGoBack}
      />
    )
  }

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
        bottomOffset={16}
      >
        <View style={styles.progressContainer}>
          <View style={styles.pill}>
            <MessageSquareText
              size={16}
              color={theme.colors.textMuted}
            />
            <Text
              variant='pSmBold'
              color='muted'
            >
              {transactions.length - currentIndex} of {transactions.length} remaining
            </Text>
          </View>
        </View>
        <View style={styles.cardContainer}>
          <ExpenseReview
            transaction={transactions[currentIndex]}
            amountValue={amountValue}
            merchantValue={merchantValue}
            categoryValue={categoryValue}
            onChangeAmount={setAmountValue}
            onChangeMerchant={setMerchantValue}
            onChangeCategory={setCategoryValue}
          />
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.actionsRow}>
        <IconButton
          disabled={isSaving}
          onPress={handleReject}
        >
          <View style={[styles.iconCircleBase, styles.rejectCircle(isSaving)]}>
            <X
              size={32}
              color={styles.rejectColor(isSaving).color}
            />
          </View>
          <Text
            variant='pSm'
            style={styles.rejectColor(isSaving)}
          >
            Reject
          </Text>
        </IconButton>
        <IconButton
          disabled={isSaving}
          onPress={handleConfirm}
        >
          <View style={[styles.iconCircleBase, styles.confirmCircle(isSaving)]}>
            <Check
              size={32}
              color={theme.colors.surface}
            />
          </View>
          <Text
            variant='pSmBold'
            style={styles.confirmColor(isSaving)}
          >
            Confirm
          </Text>
        </IconButton>
      </View>
    </View>
  )
}
