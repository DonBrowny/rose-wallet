import type { Expense } from '@/types/expense'
import { formatDateHeader } from '@/utils/date/format-date-header'
import { getDateKey } from '@/utils/date/get-date-key'

type DateHeader = { type: 'header'; date: string }
type ExpenseItem = { type: 'expense'; expense: Expense }
export type GroupedExpenseItem = DateHeader | ExpenseItem

interface AccumulatorState {
  items: GroupedExpenseItem[]
  currentDateKey: string
}

export function groupExpensesByDate(expenses: Expense[]): GroupedExpenseItem[] {
  const initial: AccumulatorState = { items: [], currentDateKey: '' }

  return expenses.reduce<AccumulatorState>((acc, expense) => {
    const dateKey = getDateKey(expense.receivedAt)

    if (dateKey !== acc.currentDateKey) {
      acc.items.push({ type: 'header', date: formatDateHeader(expense.receivedAt) })
      acc.currentDateKey = dateKey
    }

    acc.items.push({ type: 'expense', expense })
    return acc
  }, initial).items
}
