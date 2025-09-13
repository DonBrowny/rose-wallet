import { formatCurrency } from './format-utils'

/**
 * Calculates all budget-related data needed for the UI
 * @param budget - The monthly budget amount
 * @param spent - The amount spent so far
 * @returns Object containing all calculated budget data
 */
export interface BudgetData {
  isOverBudget: boolean
  remainingDays: number
  dailyAllowance: number
  dailyAllowanceMessage: string
  budgetFormatted: string
  spentFormatted: string
}

export function calculateBudgetData(budget: number, spent: number): BudgetData {
  // Calculate basic metrics
  const isOverBudget = spent > budget
  const remainingBudget = budget - spent

  // Calculate remaining days in current month
  const now = new Date()
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const remainingDays = Math.max(0, lastDayOfMonth - now.getDate())

  // Calculate daily spending allowance
  const dailyAllowance = remainingDays > 0 ? remainingBudget / remainingDays : 0

  // Format values
  const budgetFormatted = formatCurrency(budget)
  const spentFormatted = formatCurrency(spent)

  // Generate contextual daily allowance message
  let dailyAllowanceMessage = ''
  if (isOverBudget) {
    dailyAllowanceMessage = 'Budget exceeded'
  } else if (dailyAllowance <= 0) {
    dailyAllowanceMessage = 'No remaining budget'
  } else {
    dailyAllowanceMessage = `₹${Math.round(dailyAllowance)} per day`
  }

  return {
    isOverBudget,
    remainingDays,
    dailyAllowance,
    dailyAllowanceMessage,
    budgetFormatted,
    spentFormatted,
  }
}
