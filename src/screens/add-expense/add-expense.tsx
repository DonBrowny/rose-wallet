import { ExpenseReview } from '@/components/expense-review/expense-review'
import { Button } from '@/components/ui/button/button'
import { ProgressBar } from '@/components/ui/progress-bar/progress-bar'
import { Text } from '@/components/ui/text/text'
import { useSaveExpense } from '@/hooks/use-save-expense'
import { useSMSTransactions } from '@/hooks/use-sms-transactions'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { styles } from './add-expense.style'

export default function AddExpenseScreen() {
  const { data: transactions = [], isLoading, errorMessage } = useSMSTransactions()
  const { mutate: saveExpense, isPending: isSaving } = useSaveExpense()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [amountValue, setAmountValue] = useState('')
  const [merchantValue, setMerchantValue] = useState('')
  const [categoryValue, setCategoryValue] = useState('')

  // Prefill inputs when the current item changes
  useEffect(() => {
    const tx = transactions[currentIndex]
    if (!tx) return
    setAmountValue(String(tx.amount ?? ''))
    setMerchantValue(tx.merchant ?? '')
    setCategoryValue('')
  }, [transactions, currentIndex])

  function handlePrevious() {
    const prev = Math.max(0, currentIndex - 1)
    setCurrentIndex(prev)
  }

  function handleSave() {
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
          const next = Math.min(transactions.length - 1, currentIndex + 1)
          setCurrentIndex(next)
        },
        onError: (e) => {
          console.warn('Save expense failed', e)
        },
      }
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text variant='h3'>Add Expense</Text>
        <Text
          variant='pSm'
          color='muted'
          style={styles.subHeader}
        >
          Recent transactional SMS
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text
            variant='pMd'
            color='muted'
          >
            Loading SMS…
          </Text>
        </View>
      ) : errorMessage ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
          <Text
            variant='pMd'
            color='muted'
          >
            {errorMessage}
          </Text>
        </View>
      ) : transactions.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text
            variant='pMd'
            color='muted'
          >
            No transactional SMS found.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.progressContainer}>
            <ProgressBar
              total={transactions.length}
              currentIndex={currentIndex}
            />
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
          <View style={styles.actionsRow}>
            <Button
              type='outline'
              title='Previous'
              disabled={isSaving || currentIndex === 0 || transactions.length === 0}
              onPress={handlePrevious}
            />
            <View style={{ flex: 1 }} />
            <Button
              title='Save'
              disabled={isSaving || transactions.length === 0}
              onPress={handleSave}
            />
          </View>
        </>
      )}
    </View>
  )
}
