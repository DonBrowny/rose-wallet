import type { Expense } from '@/types/expense'
import { formatDateHeader } from '@/utils/date/format-date-header'
import { getDateKey } from '@/utils/date/get-date-key'

type DateHeader = { type: 'header'; date: string; total: number; count: number }
type ExpenseItem = { type: 'expense'; expense: Expense }
export type GroupedExpenseItem = DateHeader | ExpenseItem

interface DateGroup {
  date: string
  total: number
  count: number
  expenses: Expense[]
}

export function groupExpensesByDate(expenses: Expense[]): GroupedExpenseItem[] {
  const groups = expenses.reduce<Map<string, DateGroup>>((acc, expense) => {
    const dateKey = getDateKey(expense.receivedAt)

    if (!acc.has(dateKey)) {
      acc.set(dateKey, {
        date: formatDateHeader(expense.receivedAt),
        total: 0,
        count: 0,
        expenses: [],
      })
    }

    const group = acc.get(dateKey)!
    group.total += expense.amount
    group.count += 1
    group.expenses.push(expense)

    return acc
  }, new Map())

  return Array.from(groups.values()).flatMap((group) => [
    { type: 'header' as const, date: group.date, total: group.total, count: group.count },
    ...group.expenses.map((expense) => ({ type: 'expense' as const, expense })),
  ])
}
