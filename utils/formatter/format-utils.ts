/**
 * Formats currency amounts with Indian notation (Lakhs, Crores) only when needed
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "₹5000", "₹10.55 L", "₹1.25 Cr")
 */
export function formatCurrency(amount: number): string {
  const absAmount = Math.abs(amount)

  if (absAmount >= 10000000) {
    // 1 Crore or more
    const crores = amount / 10000000
    return `₹${crores.toFixed(2)} Cr`
  } else if (absAmount >= 100000) {
    // 1 Lakh or more
    const lakhs = amount / 100000
    return `₹${lakhs.toFixed(2)} L`
  } else {
    return `₹${Math.round(amount)}`
  }
}

/**
 * Formats percentage with edge case handling
 * @param percentage - The percentage value
 * @returns Formatted percentage string
 */
export function formatPercentage(percentage: number): string {
  if (percentage >= 1000) {
    return `${Math.round(percentage / 1000)}K%`
  } else if (percentage >= 100) {
    return `${percentage.toFixed(0)}%`
  } else {
    return `${percentage.toFixed(1)}%`
  }
}
