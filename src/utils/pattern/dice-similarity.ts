import type { Bigrams } from './bigrams'

/**
 * Sørensen–Dice coefficient over two precomputed bigram multisets. Returns 0..1.
 */
export function diceSimilarity(a: Bigrams, b: Bigrams): number {
  if (a.total === 0 || b.total === 0) return 0

  const [small, large] = a.counts.size <= b.counts.size ? [a, b] : [b, a]
  let intersection = 0
  for (const [bigram, count] of small.counts) {
    const other = large.counts.get(bigram)
    if (other) intersection += Math.min(count, other)
  }

  return (2 * intersection) / (a.total + b.total)
}
