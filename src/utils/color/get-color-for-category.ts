export const CATEGORY_COLORS = [
  'accentBlue',
  'accentGreen',
  'accentPurple',
  'accentOrange',
  'accentRed',
  'accentYellow',
] as const

export type CategoryColor = (typeof CATEGORY_COLORS)[number]

/**
 * Returns a consistent color for a given category name using a hash function.
 * The same category name will always return the same color.
 */
export function getColorForCategory(categoryName: string): CategoryColor {
  let hash = 0
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]
}
