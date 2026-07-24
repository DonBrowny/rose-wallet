import { bigrams } from './bigrams'
import { diceSimilarity } from './dice-similarity'

describe('diceSimilarity', () => {
  it('returns 1 for identical strings', () => {
    expect(diceSimilarity(bigrams('debited from account'), bigrams('debited from account'))).toBe(1)
  })

  it('returns 0 for disjoint strings', () => {
    expect(diceSimilarity(bigrams('abcd'), bigrams('wxyz'))).toBe(0)
  })

  it('computes the classic night/nacht example', () => {
    expect(diceSimilarity(bigrams('night'), bigrams('nacht'))).toBe(0.25)
  })

  it('returns 0 when either side is empty', () => {
    expect(diceSimilarity(bigrams(''), bigrams('abcd'))).toBe(0)
    expect(diceSimilarity(bigrams(''), bigrams(''))).toBe(0)
  })
})
