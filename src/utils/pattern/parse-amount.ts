/**
 * Parse an amount string extracted from an SMS into a number.
 * Tolerates comma grouping ("1,23,456.78"). Returns null for anything
 * that is not a plain positive currency value.
 */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/,/g, '').trim()
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null

  const value = Number(cleaned)
  return Number.isFinite(value) && value > 0 ? value : null
}
