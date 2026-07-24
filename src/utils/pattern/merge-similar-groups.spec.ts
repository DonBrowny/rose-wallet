import { mergeSimilarGroups } from './merge-similar-groups'

describe('mergeSimilarGroups', () => {
  const debitA = '<CUR><AMT> debited from a/c <LAST4> on <DATE> to vpa <VPA> upi ref <REF>'
  const debitB = '<CUR><AMT> debited from a/c <LAST4> on <DATE> to vpa <VPA> upi ref no <REF>'
  const promo = 'flat 50% off on your next order! use code SAVE50 valid till <DATE>'

  it('merges near-duplicate templates into the larger group', () => {
    const groups = mergeSimilarGroups([
      { groupingPattern: debitA, items: [1, 2, 3] },
      { groupingPattern: debitB, items: [4] },
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0].groupingPattern).toBe(debitA)
    expect(groups[0].items).toEqual([1, 2, 3, 4])
  })

  it('keeps dissimilar templates separate', () => {
    const groups = mergeSimilarGroups([
      { groupingPattern: debitA, items: [1] },
      { groupingPattern: promo, items: [2] },
    ])
    expect(groups).toHaveLength(2)
  })

  it('does not mutate the input groups', () => {
    const input = [
      { groupingPattern: debitA, items: [1] },
      { groupingPattern: debitB, items: [2] },
    ]
    mergeSimilarGroups(input)
    expect(input[0].items).toEqual([1])
    expect(input[1].items).toEqual([2])
  })
})
