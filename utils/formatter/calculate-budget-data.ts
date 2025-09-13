import { formatCurrency, formatPercentage } from './format-utils'

/**
 * Calculates all budget-related data needed for the UI
 * @param budget - The monthly budget amount
 * @param spent - The amount spent so far
 * @returns Object containing all calculated budget data
 */
export interface BudgetData {
  budgetUsed: number
  isOverBudget: boolean
  remainingBudget: number
  remainingDays: number
  dailyAllowance: number
  isExtremeValue: boolean
  budgetUsedPercentage: string
  dailyAllowanceFormatted: string
  remainingBudgetFormatted: string
  budgetFormatted: string
  spentFormatted: string
}

export function calculateBudgetData(budget: number, spent: number): BudgetData {
  // Handle edge cases for extremely large numbers
  const isExtremeValue = spent > 999999999 || budget > 999999999

  // Calculate basic metrics
  const budgetUsed = budget > 0 ? Math.min((spent / budget) * 100, 999999) : 0
  const isOverBudget = spent > budget
  const remainingBudget = budget - spent

  // Calculate remaining days in current month
  const now = new Date()
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const remainingDays = Math.max(0, lastDayOfMonth - now.getDate())

  // Calculate daily spending allowance
  const dailyAllowance = remainingDays > 0 ? remainingBudget / remainingDays : 0

  // Format values based on extreme value detection
  const budgetFormatted = isExtremeValue ? '₹999Cr+' : formatCurrency(budget)
  const spentFormatted = isExtremeValue ? '₹999Cr+' : formatCurrency(spent)
  const remainingBudgetFormatted = isExtremeValue ? '₹0' : formatCurrency(Math.abs(remainingBudget))
  const dailyAllowanceFormatted = isExtremeValue ? '₹0' : formatCurrency(Math.max(0, dailyAllowance))

  // Format percentage with edge case handling
  const budgetUsedPercentage = isExtremeValue ? '999K%+' : formatPercentage(budgetUsed)

  return {
    budgetUsed,
    isOverBudget,
    remainingBudget,
    remainingDays,
    dailyAllowance,
    isExtremeValue,
    budgetUsedPercentage,
    dailyAllowanceFormatted,
    remainingBudgetFormatted,
    budgetFormatted,
    spentFormatted,
  }
}
