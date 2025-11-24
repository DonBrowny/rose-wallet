import { ExpenseReview } from '@/components/expense-review/expense-review'
import { Button } from '@/components/ui/button/button'
import { ProgressBar } from '@/components/ui/progress-bar/progress-bar'
import { Text } from '@/components/ui/text/text'
import { saveExpense } from '@/services/database/save-expense'
import { SMSService } from '@/services/sms-parsing/sms-service'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import type { Transaction } from '@/types/sms/transaction'
import { storage } from '@/utils/mmkv/storage'
import { getActivePatternsCache, matchPatternAndExtractFromDB } from '@/utils/pattern/match-pattern-from-mmkv'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { styles } from './add-expense.style'

function getThreeMonthsAgoTimestamp(): number {
  const d = new Date()
  d.setMonth(d.getMonth() - 3)
  return d.getTime()
}

export default function AddExpenseScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [amountValue, setAmountValue] = useState('')
  const [merchantValue, setMerchantValue] = useState('')
  const [categoryValue, setCategoryValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function enrichTransactionsWithPatterns(list: Transaction[]): Promise<Transaction[]> {
    try {
      const patterns = await getActivePatternsCache()
      const enriched = await Promise.all(
        list.map(async (tx) => {
          try {
            const result = await matchPatternAndExtractFromDB(tx.message.body, patterns)
            return {
              ...tx,
              amount: typeof result.amount === 'number' && !Number.isNaN(result.amount) ? result.amount : tx.amount,
              merchant: result.merchant || tx.merchant,
            }
          } catch {
            return tx
          }
        })
      )
      return enriched
    } catch {
      return list
    }
  }

  useEffect(() => {
    let mounted = true

    async function loadSMS() {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const lastRead = storage.getNumber(MMKV_KEYS.SMS.LAST_READ_AT)
        const startTimestamp = typeof lastRead === 'number' ? lastRead : getThreeMonthsAgoTimestamp()
        const endTimestamp = Date.now()

        const result = await SMSService.getTransactionsFromSMS({ startTimestamp, endTimestamp })

        if (!mounted) return

        if (!result.success) {
          setErrorMessage(result.errors[0] || 'Failed to load SMS')
          setTransactions([])
          return
        }

        const enriched = await enrichTransactionsWithPatterns(result.transactions)
        if (!mounted) return
        setTransactions(enriched)
      } catch (err) {
        if (!mounted) return
        setErrorMessage(err instanceof Error ? err.message : 'Unexpected error while loading SMS')
        setTransactions([])
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadSMS()
    return () => {
      mounted = false
    }
  }, [])

  // Prefill inputs when the current item changes
  useEffect(() => {
    const tx = transactions[currentIndex]
    if (!tx) return
    setAmountValue(String(tx.amount ?? ''))
    setMerchantValue(tx.merchant ?? '')
    setCategoryValue('')
  }, [transactions, currentIndex])

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
              onPress={() => {
                const next = Math.max(0, currentIndex - 1)
                setCurrentIndex(next)
              }}
            />
            <View style={{ flex: 1 }} />
            <Button
              title='Save'
              disabled={isSaving || currentIndex === transactions.length - 1 || transactions.length === 0}
              onPress={async () => {
                if (isSaving) return
                setIsSaving(true)
                try {
                  const tx = transactions[currentIndex]
                  const patterns = await getActivePatternsCache()
                  const match = await matchPatternAndExtractFromDB(tx.message.body, patterns)
                  await saveExpense({
                    smsBody: tx.message.body,
                    smsSender: tx.message.address,
                    smsDate: tx.message.date,
                    merchantName: merchantValue || tx.merchant || 'Unknown',
                    categoryName: categoryValue || 'Other',
                    patternName: match.patternName,
                    amount: Number(amountValue),
                    currency: 'INR',
                    type: 'debit',
                  })
                  const next = Math.min(transactions.length - 1, currentIndex + 1)
                  setCurrentIndex(next)
                } catch (e) {
                  console.warn('Save expense failed', e)
                } finally {
                  setIsSaving(false)
                }
              }}
            />
          </View>
        </>
      )}
    </View>
  )
}
