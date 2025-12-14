import type { Pattern } from '@/db/schema'
import { matchPatternAndExtract } from './match-pattern-and-extract'

jest.mock('./extraction-template-builder', () => ({
  extractAmountAndMerchant: jest.fn((template: string, sms: string) => {
    if (template.includes('amount')) {
      return { amount: '100', merchant: 'SHOP' }
    }
    return { amount: undefined, merchant: undefined }
  }),
}))

jest.mock('./normalize-sms-template', () => ({
  normalizeSMSTemplate: jest.fn((sms: string) => sms.toLowerCase().replace(/[0-9]/g, 'X')),
}))

function makePattern(overrides: Partial<Pattern>): Pattern {
  return {
    id: 1,
    name: 'test-pattern',
    groupingPattern: 'test grouping',
    extractionPattern: 'amount template',
    type: 'debit',
    status: 'approved',
    isActive: true,
    usageCount: 0,
    lastUsedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('matchPatternAndExtract', () => {
  describe('empty input handling', () => {
    it('returns empty result for empty string', () => {
      const result = matchPatternAndExtract('', [])
      expect(result).toEqual({})
    })

    it('returns empty result for whitespace-only string', () => {
      const result = matchPatternAndExtract('   ', [])
      expect(result).toEqual({})
    })

    it('returns empty result for null/undefined input', () => {
      const result = matchPatternAndExtract(null as unknown as string, [])
      expect(result).toEqual({})
    })

    it('returns empty result when no patterns provided', () => {
      const result = matchPatternAndExtract('some sms body', [])
      expect(result).toEqual({})
    })
  })

  describe('exact match (fast path)', () => {
    it('returns pattern on exact match', () => {
      const pattern = makePattern({
        id: 42,
        name: 'exact-match',
        groupingPattern: 'test sms',
        extractionPattern: 'amount template',
      })

      const result = matchPatternAndExtract('test sms', [pattern])

      expect(result.patternId).toBe(42)
      expect(result.patternName).toBe('exact-match')
      expect(result.amount).toBe('100')
      expect(result.merchant).toBe('SHOP')
    })

    it('prefers exact match over similarity match', () => {
      const exactPattern = makePattern({
        id: 1,
        name: 'exact',
        groupingPattern: 'test sms',
      })
      const similarPattern = makePattern({
        id: 2,
        name: 'similar',
        groupingPattern: 'test sms body',
      })

      const result = matchPatternAndExtract('test sms', [similarPattern, exactPattern])

      expect(result.patternId).toBe(1)
      expect(result.patternName).toBe('exact')
    })
  })

  describe('similarity match (slow path)', () => {
    it('returns pattern when similarity >= 0.8', () => {
      const pattern = makePattern({
        id: 10,
        name: 'similar-pattern',
        groupingPattern: 'your account xxxx credited with rs.xxx',
      })

      // This will be normalized to similar string
      const result = matchPatternAndExtract('your account 1234 credited with rs.500', [pattern])

      expect(result.patternId).toBe(10)
      expect(result.patternName).toBe('similar-pattern')
    })

    it('returns empty when similarity < 0.8', () => {
      const pattern = makePattern({
        id: 1,
        groupingPattern: 'completely different text here',
      })

      const result = matchPatternAndExtract('your account credited', [pattern])

      expect(result).toEqual({})
    })

    it('returns best match when multiple patterns match', () => {
      const pattern1 = makePattern({
        id: 1,
        name: 'less-similar',
        groupingPattern: 'account x credited',
      })
      const pattern2 = makePattern({
        id: 2,
        name: 'more-similar',
        groupingPattern: 'account xxxx credited with rs.xxx',
      })

      const result = matchPatternAndExtract('account 1234 credited with rs.500', [pattern1, pattern2])

      expect(result.patternId).toBe(2)
      expect(result.patternName).toBe('more-similar')
    })
  })

  describe('extraction', () => {
    it('extracts amount and merchant when extractionPattern exists', () => {
      const pattern = makePattern({
        id: 1,
        groupingPattern: 'test sms',
        extractionPattern: 'amount template',
      })

      const result = matchPatternAndExtract('test sms', [pattern])

      expect(result.amount).toBe('100')
      expect(result.merchant).toBe('SHOP')
    })

    it('returns undefined amount/merchant when no extractionPattern', () => {
      const pattern = makePattern({
        id: 1,
        groupingPattern: 'test sms',
        extractionPattern: '',
      })

      const result = matchPatternAndExtract('test sms', [pattern])

      expect(result.patternId).toBe(1)
      expect(result.amount).toBeUndefined()
      expect(result.merchant).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('skips patterns with empty groupingPattern', () => {
      const pattern1 = makePattern({
        id: 1,
        groupingPattern: '',
      })
      const pattern2 = makePattern({
        id: 2,
        groupingPattern: 'test sms',
      })

      const result = matchPatternAndExtract('test sms', [pattern1, pattern2])

      expect(result.patternId).toBe(2)
    })

    it('handles patterns with null groupingPattern', () => {
      const pattern = makePattern({
        id: 1,
        groupingPattern: null as unknown as string,
      })

      const result = matchPatternAndExtract('test sms', [pattern])

      expect(result).toEqual({})
    })
  })
})
