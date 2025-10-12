import { calculateBudgetData } from './calculate-budget-data'

describe('calculateBudgetData', () => {
  const setSystemTimeTo = (iso: string) => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(iso))
  }

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('calculates remainingDays within current month deterministically', () => {
    setSystemTimeTo('2025-01-10T12:00:00.000Z')
    const result = calculateBudgetData(3100, 0)
    expect(result.remainingDays).toBe(21)
  })

  it('formats budget and spent using formatLargeCurrency', () => {
    setSystemTimeTo('2025-05-15T12:00:00.000Z')
    const result = calculateBudgetData(100000, 25000)
    expect(result.budgetFormatted).toBe('₹1.00 L')
    expect(result.spentFormatted).toBe('₹25,000')
  })

  it('marks over budget when spent > budget', () => {
    setSystemTimeTo('2025-06-01T00:00:00.000Z')
    const result = calculateBudgetData(1000, 1001)
    expect(result.isOverBudget).toBe(true)
  })

  it('computes daily allowance and message when budget remains and days > 0', () => {
    setSystemTimeTo('2025-03-10T00:00:00.000Z')
    const result = calculateBudgetData(2100, 0)
    expect(result.dailyAllowance).toBeCloseTo(100, 5)
    expect(result.dailyAllowanceMessage).toBe('₹100 per day')
  })

  it('shows "No remaining budget" when daily allowance <= 0 but not over budget', () => {
    setSystemTimeTo('2025-04-30T12:00:00.000Z')
    const result = calculateBudgetData(1000, 1000)
    expect(result.remainingDays).toBe(0)
    expect(result.dailyAllowance).toBe(0)
    expect(result.dailyAllowanceMessage).toBe('No remaining budget')
  })

  it('shows "Budget exceeded" when over budget regardless of days', () => {
    setSystemTimeTo('2025-12-15T00:00:00.000Z')
    const result = calculateBudgetData(1000, 1500)
    expect(result.isOverBudget).toBe(true)
    expect(result.dailyAllowanceMessage).toBe('Budget exceeded')
  })
})
