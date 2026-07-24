import { bigrams } from './bigrams'

describe('bigrams', () => {
  it('counts bigram multiplicity', () => {
    const result = bigrams('abab')
    expect(result.total).toBe(3)
    expect(result.counts.get('ab')).toBe(2)
    expect(result.counts.get('ba')).toBe(1)
  })

  it('is case-insensitive', () => {
    expect(bigrams('AB').counts.get('ab')).toBe(1)
  })

  it('returns an empty multiset for short input', () => {
    expect(bigrams('').total).toBe(0)
    expect(bigrams('a').total).toBe(0)
  })
})
