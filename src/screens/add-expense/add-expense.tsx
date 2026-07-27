import { EditQuickCategories } from '@/components/edit-quick-categories/edit-quick-categories'
import { ExpenseReview } from '@/components/expense-review/expense-review'
import { Loading } from '@/components/loading/loading'
import { SuccessState } from '@/components/success-state/success-state'
import { IconButton } from '@/components/ui/icon-button/icon-button'
import { Text } from '@/components/ui/text/text'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
import { useGetFavoriteCategories, useSetFavoriteCategories } from '@/hooks/use-categories'
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus'
import { useRejectExpense } from '@/hooks/use-reject-expense'
import { useSaveExpense } from '@/hooks/use-save-expense'
import { useSMSTransactions } from '@/hooks/use-sms-transactions'
import { getCategoryByMerchantName } from '@/services/database/categories-repository'
import { useRouter } from 'expo-router'
import { Check, MessageSquareText, X } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './add-expense.style'

export default function AddExpenseScreen() {
  const { theme } = useUnistyles()
  const router = useRouter()
  const { data: transactions = [], isLoading, errorMessage, refetch } = useSMSTransactions()
  const { data: favoriteCategories = [], isLoading: isFavoriteCategoriesLoading } = useGetFavoriteCategories()
  const { mutate: saveFavoriteCategories } = useSetFavoriteCategories()
  const { mutate: saveExpense, isPending: isSaving } = useSaveExpense()
  const { mutate: rejectExpense, isPending: isRejecting } = useRejectExpense()
  const [amountValue, setAmountValue] = useState('')
  const [merchantValue, setMerchantValue] = useState('')
  const [categoryValue, setCategoryValue] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [isEditCategoriesVisible, setIsEditCategoriesVisible] = useState(false)

  useRefetchOnFocus(refetch)

  // Confirming/rejecting removes the item from the list rather than advancing
  // through it, so the original count has to be captured once for "X of Y".
  const initialTotalRef = useRef<number | null>(null)
  if (transactions.length > 0 && initialTotalRef.current === null) {
    initialTotalRef.current = transactions.length
  }
  const totalCount = initialTotalRef.current ?? transactions.length

  const isLastItem = transactions.length <= 1
  const isBusy = isSaving || isRejecting

  // Prefill inputs when the current item changes (including auto-fill category)
  useEffect(() => {
    const tx = transactions[0]
    if (!tx) return
    setAmountValue(String(tx.amount ?? ''))
    setMerchantValue(tx.merchantRaw)

    // Auto-fill category based on merchant-category mapping
    async function autoFillCategory() {
      if (tx.merchantRaw) {
        const category = await getCategoryByMerchantName(tx.merchantRaw)
        setCategoryValue(category ?? '')
      } else {
        setCategoryValue('')
      }
    }
    autoFillCategory()
  }, [transactions])

  function handleSaveCategories(categories: string[]) {
    saveFavoriteCategories(categories)
  }

  function handleReject() {
    const tx = transactions[0]
    if (!tx) return

    rejectExpense(tx, {
      onSuccess: () => {
        // The rejected item is removed from the cached list, so the next
        // transaction slides into position 0 on its own.
        if (isLastItem) {
          setIsCompleted(true)
        }
      },
      onError: (e) => {
        console.warn('Reject expense failed', e)
      },
    })
  }

  function handleConfirm() {
    const tx = transactions[0]
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
          // The saved item is removed from the cached list, so the next
          // transaction slides into position 0 on its own.
          if (isLastItem) {
            setIsCompleted(true)
          }
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

  if (isLoading) {
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
              {transactions.length} of {totalCount} remaining
            </Text>
          </View>
        </View>
        <View style={styles.cardContainer}>
          <ExpenseReview
            transaction={transactions[0]}
            amountValue={amountValue}
            merchantValue={merchantValue}
            categoryValue={categoryValue}
            onChangeAmount={setAmountValue}
            onChangeMerchant={setMerchantValue}
            onChangeCategory={setCategoryValue}
            favoriteCategories={favoriteCategories}
            isFavoriteCategoriesLoading={isFavoriteCategoriesLoading}
            onEditCategories={() => setIsEditCategoriesVisible(true)}
          />
        </View>
      </KeyboardAwareScrollView>
      <EditQuickCategories
        isVisible={isEditCategoriesVisible}
        onClose={() => setIsEditCategoriesVisible(false)}
        onSave={handleSaveCategories}
        currentCategories={favoriteCategories.length > 0 ? favoriteCategories.map((c) => c.name) : DEFAULT_CATEGORIES}
      />
      <View style={styles.actionsRow}>
        <IconButton
          disabled={isBusy}
          onPress={handleReject}
        >
          <View style={[styles.iconCircleBase, styles.rejectCircle(isBusy)]}>
            <X
              size={32}
              color={styles.rejectColor(isBusy).color}
            />
          </View>
          <Text
            variant='pSm'
            style={styles.rejectColor(isBusy)}
          >
            Reject
          </Text>
        </IconButton>
        <IconButton
          disabled={isBusy}
          onPress={handleConfirm}
        >
          <View style={[styles.iconCircleBase, styles.confirmCircle(isBusy)]}>
            <Check
              size={32}
              color={theme.colors.surface}
            />
          </View>
          <Text
            variant='pSmBold'
            style={styles.confirmColor(isBusy)}
          >
            Confirm
          </Text>
        </IconButton>
      </View>
    </View>
  )
}
