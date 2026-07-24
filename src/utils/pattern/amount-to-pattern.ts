/**
 * Build a regex that finds the textual occurrence of a known amount inside an SMS body,
 * tolerating Indian comma grouping and optional decimals: 1500 matches "1500", "1,500",
 * "1,500.00". Used when placing the <AMT> placeholder into a sample message.
 */
export function amountToPattern(amount: number): RegExp | null {
  if (!Number.isFinite(amount) || amount <= 0) return null

  const [intPart, fracPart] = amount.toFixed(2).split('.')
  const digits = intPart.split('').join(',?')
  const frac = fracPart.replace(/0+$/, '')

  let fracPattern: string
  if (!frac) {
    fracPattern = '(?:\\.0{1,2})?'
  } else if (frac.length === 1) {
    fracPattern = `\\.${frac}0?`
  } else {
    fracPattern = `\\.${frac}`
  }

  return new RegExp(`(?<![\\d,])${digits}${fracPattern}(?!\\d)`)
}
