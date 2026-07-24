import { bigrams, type Bigrams } from './bigrams'
import { diceSimilarity } from './dice-similarity'
import type { TemplateGroup } from './group-by-template'
import { GROUPING_MATCH_THRESHOLD } from './match-pattern'

/**
 * Merge exact-match groups whose templates are near-duplicates (Dice >= threshold).
 * Runs on unique templates only — far fewer than the original messages. Larger
 * groups become the representatives, so merged items adopt the most common template.
 */
export function mergeSimilarGroups<T>(
  groups: TemplateGroup<T>[],
  threshold: number = GROUPING_MATCH_THRESHOLD
): TemplateGroup<T>[] {
  const bySize = [...groups].sort((a, b) => b.items.length - a.items.length)
  const merged: { group: TemplateGroup<T>; bigrams: Bigrams }[] = []

  for (const group of bySize) {
    const groupBigrams = bigrams(group.groupingPattern)
    const host = merged.find((m) => diceSimilarity(m.bigrams, groupBigrams) >= threshold)
    if (host) {
      host.group.items.push(...group.items)
    } else {
      merged.push({ group: { groupingPattern: group.groupingPattern, items: [...group.items] }, bigrams: groupBigrams })
    }
  }

  return merged.map((m) => m.group)
}
