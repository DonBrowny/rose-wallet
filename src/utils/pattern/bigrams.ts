export interface Bigrams {
  counts: Map<string, number>
  total: number
}

/**
 * Build the case-insensitive bigram multiset of a string.
 * Precompute once per string so similarity comparisons don't rebuild it.
 */
export function bigrams(input: string): Bigrams {
  const s = input.toLowerCase()
  const counts = new Map<string, number>()
  let total = 0

  for (let i = 0; i < s.length - 1; i++) {
    const bigram = s.slice(i, i + 2)
    counts.set(bigram, (counts.get(bigram) ?? 0) + 1)
    total++
  }

  return { counts, total }
}
