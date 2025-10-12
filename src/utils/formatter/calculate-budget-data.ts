import { formatLargeCurrency } from './format-large-currency'

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
  const isOverBudget = spent > budget
  const remainingBudget = budget - spent

  const now = new Date()
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const remainingDays = Math.max(0, lastDayOfMonth - now.getDate())
  const dailyAllowance = remainingDays > 0 ? remainingBudget / remainingDays : 0

  const budgetFormatted = formatLargeCurrency(budget)
  const spentFormatted = formatLargeCurrency(spent)

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
