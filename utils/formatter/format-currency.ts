/**
 * Formats a number as currency in Indian Rupees (INR)
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "₹3,200")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount)
}
