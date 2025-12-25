import { Overlay } from '@/components/ui/overlay/overlay'
import { useDeleteExpense } from '@/hooks/use-delete-expense'
import { useGetExpenseById } from '@/hooks/use-get-expense-by-id'
import { useAppStore } from '@/hooks/use-store'
import { useUpdateExpense } from '@/hooks/use-update-expense'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { DeleteExpenseContent } from '@/components/delete-expense-content/delete-expense-content'
import { EditExpenseContent } from '@/components/edit-expense-content/edit-expense-content'
import { styles } from './edit-expense-modal.style'

export function EditExpenseModal() {
  const { isOpen, expenseId } = useAppStore((s) => s.editExpenseModal)
  const closeEditExpenseModal = useAppStore((s) => s.closeEditExpenseModal)

  const { data: expense, isLoading } = useGetExpenseById(expenseId)
  const updateExpense = useUpdateExpense()
  const deleteExpense = useDeleteExpense()

  const [amount, setAmount] = useState('')
  const [merchantName, setMerchantName] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (expense && isOpen) {
      setAmount(expense.amount.toString())
      setMerchantName(expense.merchantName)
      setCategoryName(expense.categoryName)
      setShowDeleteConfirm(false)
    }
  }, [expense, isOpen])

  const handleSave = () => {
    if (!expense) return
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) return

    updateExpense.mutate(
      {
        id: expense.id,
        amount: parsedAmount,
        merchantName: merchantName.trim() || 'Unknown',
        categoryName: categoryName.trim() || 'Other',
      },
      {
        onSuccess: () => {
          closeEditExpenseModal()
        },
      }
    )
  }

  const handleDeletePress = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  const handleDeleteConfirm = () => {
    if (!expense) return
    deleteExpense.mutate(expense.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false)
        closeEditExpenseModal()
      },
    })
  }

  const handleClose = () => {
    setShowDeleteConfirm(false)
    closeEditExpenseModal()
  }

  return (
    <Overlay
      testID='edit-expense-modal'
      isVisible={isOpen}
      onBackdropPress={handleClose}
      overlayStyle={styles.overlay}
    >
      <View style={styles.overlayContent}>
        {isLoading || !expense ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='small' />
          </View>
        ) : showDeleteConfirm ? (
          <DeleteExpenseContent
            expense={expense}
            onCancel={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            isDeleting={deleteExpense.isPending}
          />
        ) : (
          <EditExpenseContent
            expense={expense}
            amount={amount}
            merchantName={merchantName}
            categoryName={categoryName}
            onAmountChange={setAmount}
            onMerchantChange={setMerchantName}
            onCategoryChange={setCategoryName}
            onDelete={handleDeletePress}
            onSave={handleSave}
            isSaving={updateExpense.isPending}
          />
        )}
      </View>
    </Overlay>
  )
}
