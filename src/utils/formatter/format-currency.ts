/**
 * Formats a number as currency in Indian Rupees (INR)
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "₹3,200")
 */
export function formatCurrency(amount: number, roundToTwoDecimals = false): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: roundToTwoDecimals ? 2 : 0,
  }).format(amount)
}
