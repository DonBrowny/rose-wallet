import { bigrams, type Bigrams } from './bigrams'
import { diceSimilarity } from './dice-similarity'

export const GROUPING_MATCH_THRESHOLD = 0.8

export interface MatchCandidate<T> {
  value: T
  groupingPattern: string
  bigrams: Bigrams
}

export interface PatternMatch<T> {
  value: T
  score: number
}

/**
 * Match a normalized SMS template against candidate grouping patterns.
 * Exact string equality wins immediately; otherwise the best Dice similarity
 * above the threshold. Candidates whose length makes the threshold unreachable
 * are skipped without computing similarity.
 */
export function matchPattern<T>(normalizedSms: string, candidates: MatchCandidate<T>[]): PatternMatch<T> | null {
  if (!normalizedSms) return null

  for (const candidate of candidates) {
    if (candidate.groupingPattern === normalizedSms) {
      return { value: candidate.value, score: 1 }
    }
  }

  const target = bigrams(normalizedSms)
  let best: PatternMatch<T> | null = null

  for (const candidate of candidates) {
    const combined = target.total + candidate.bigrams.total
    if (combined === 0) continue

    const maxPossible = (2 * Math.min(target.total, candidate.bigrams.total)) / combined
    if (maxPossible < GROUPING_MATCH_THRESHOLD) continue

    const score = diceSimilarity(target, candidate.bigrams)
    if (score >= GROUPING_MATCH_THRESHOLD && (!best || score > best.score)) {
      best = { value: candidate.value, score }
    }
  }

  return best
}
