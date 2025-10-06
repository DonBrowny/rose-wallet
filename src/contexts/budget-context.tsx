import { MMKV_KEYS } from '@/types/mmkv-keys'
import React, { createContext, ReactNode, useContext } from 'react'
import { useMMKVNumber } from 'react-native-mmkv'

const DEFAULT_MONTHLY_BUDGET = 50000

interface BudgetContextType {
  monthlyBudget: number
  budgetChangeHandler: (value: number) => void
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

interface BudgetProviderProps {
  children: ReactNode
}

export function BudgetProvider({ children }: BudgetProviderProps) {
  const [monthlyBudget = DEFAULT_MONTHLY_BUDGET, setMonthlyBudget] = useMMKVNumber(MMKV_KEYS.BUDGET.MONTHLY_BUDGET)

  const budgetChangeHandler = (value: number) => {
    if (value > 0) {
      setMonthlyBudget(value)
    }
  }

  const contextValue: BudgetContextType = {
    monthlyBudget,
    budgetChangeHandler,
  }

  return <BudgetContext.Provider value={contextValue}>{children}</BudgetContext.Provider>
}

export function useBudgetContext() {
  const context = useContext(BudgetContext)
  if (context === undefined) {
    throw new Error('useBudgetContext must be used within a BudgetProvider')
  }
  return context
}
