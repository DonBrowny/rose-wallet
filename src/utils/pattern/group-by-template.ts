export interface TemplateGroup<T> {
  groupingPattern: string
  items: T[]
}

/**
 * Group items by exact normalized-template equality via a Map — O(n).
 * Most SMS from the same bank template normalize to the identical string,
 * so this collapses the bulk of the grouping work before any similarity math.
 */
export function groupByTemplate<T>(items: T[], getTemplate: (item: T) => string): TemplateGroup<T>[] {
  const groups = new Map<string, T[]>()

  for (const item of items) {
    const template = getTemplate(item)
    if (!template) continue
    const existing = groups.get(template)
    if (existing) existing.push(item)
    else groups.set(template, [item])
  }

  return Array.from(groups, ([groupingPattern, groupItems]) => ({ groupingPattern, items: groupItems }))
}
