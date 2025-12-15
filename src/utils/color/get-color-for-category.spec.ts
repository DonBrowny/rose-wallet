import { CATEGORY_COLORS, getColorForCategory } from './get-color-for-category'

describe('getColorForCategory', () => {
  it('returns a valid category color', () => {
    const result = getColorForCategory('Food')
    expect(CATEGORY_COLORS).toContain(result)
  })

  it('returns consistent color for the same category name', () => {
    const color1 = getColorForCategory('Transport')
    const color2 = getColorForCategory('Transport')
    expect(color1).toBe(color2)
  })

  it('returns different colors for different category names', () => {
    const colors = new Set([
      getColorForCategory('Food'),
      getColorForCategory('Transport'),
      getColorForCategory('Entertainment'),
      getColorForCategory('Shopping'),
      getColorForCategory('Bills'),
      getColorForCategory('Health'),
    ])
    expect(colors.size).toBeGreaterThan(1)
  })

  it('handles empty string', () => {
    const result = getColorForCategory('')
    expect(CATEGORY_COLORS).toContain(result)
  })

  it('handles special characters', () => {
    const result = getColorForCategory('Food & Drinks')
    expect(CATEGORY_COLORS).toContain(result)
  })

  it('is case sensitive', () => {
    const lower = getColorForCategory('food')
    const upper = getColorForCategory('Food')
    expect(lower).not.toBe(upper)
  })
})
