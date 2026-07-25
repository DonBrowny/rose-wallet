export const AMT_PLACEHOLDER = '<AMT>'
export const MERCHANT_PLACEHOLDER = '<MERCHANT>'

/** True when a whitespace-delimited template token carries a placeholder (possibly with punctuation around it). */
export function isPlaceholderToken(token: string): boolean {
  return token.includes(AMT_PLACEHOLDER) || token.includes(MERCHANT_PLACEHOLDER)
}
