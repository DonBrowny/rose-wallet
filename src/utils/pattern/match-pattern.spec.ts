import { bigrams } from './bigrams'
import { matchPattern, type MatchCandidate } from './match-pattern'

function makeCandidate(id: number, groupingPattern: string): MatchCandidate<number> {
  return { value: id, groupingPattern, bigrams: bigrams(groupingPattern) }
}

describe('matchPattern', () => {
  const debitTemplate = '<CUR><AMT> debited from a/c <LAST4> on <DATE> to vpa <VPA> upi ref <REF>'
  const creditTemplate = '<CUR><AMT> credited to a/c <LAST4> on <DATE> from vpa <VPA> upi ref <REF>'
  const promoTemplate = 'flat 50% off on your next order! use code SAVE50 valid till <DATE>'

  it('returns an exact match with score 1', () => {
    const candidates = [makeCandidate(1, debitTemplate), makeCandidate(2, creditTemplate)]
    expect(matchPattern(debitTemplate, candidates)).toEqual({ value: 1, score: 1 })
  })

  it('returns the best fuzzy match above the threshold', () => {
    const target = '<CUR><AMT> debited from a/c <LAST4> on <DATE> to vpa <VPA> upi ref no <REF>'
    const candidates = [makeCandidate(1, debitTemplate), makeCandidate(2, promoTemplate)]

    const match = matchPattern(target, candidates)
    expect(match?.value).toBe(1)
    expect(match?.score).toBeGreaterThanOrEqual(0.8)
    expect(match?.score).toBeLessThan(1)
  })

  it('prefers the closer of two similar candidates', () => {
    const target = debitTemplate.replace('upi ref', 'upi ref no')
    const candidates = [makeCandidate(1, creditTemplate), makeCandidate(2, debitTemplate)]
    expect(matchPattern(target, candidates)?.value).toBe(2)
  })

  it('returns null when nothing clears the threshold', () => {
    const candidates = [makeCandidate(1, promoTemplate)]
    expect(matchPattern(debitTemplate, candidates)).toBeNull()
  })

  it('skips candidates whose length makes the threshold unreachable', () => {
    const candidates = [makeCandidate(1, debitTemplate)]
    expect(matchPattern('<CUR><AMT>', candidates)).toBeNull()
  })

  it('returns null for empty input or no candidates', () => {
    expect(matchPattern('', [makeCandidate(1, debitTemplate)])).toBeNull()
    expect(matchPattern(debitTemplate, [])).toBeNull()
  })
})
