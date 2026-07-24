import { groupByTemplate } from './group-by-template'

describe('groupByTemplate', () => {
  it('groups items with identical templates', () => {
    const items = [
      { id: 1, template: 'A' },
      { id: 2, template: 'B' },
      { id: 3, template: 'A' },
    ]
    const groups = groupByTemplate(items, (i) => i.template)

    expect(groups).toHaveLength(2)
    expect(groups.find((g) => g.groupingPattern === 'A')?.items.map((i) => i.id)).toEqual([1, 3])
    expect(groups.find((g) => g.groupingPattern === 'B')?.items.map((i) => i.id)).toEqual([2])
  })

  it('skips items with an empty template', () => {
    const groups = groupByTemplate([{ template: '' }, { template: 'A' }], (i) => i.template)
    expect(groups).toHaveLength(1)
  })

  it('returns an empty array for no items', () => {
    expect(groupByTemplate([], () => 'x')).toEqual([])
  })
})
