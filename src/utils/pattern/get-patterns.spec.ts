import type { Pattern } from '@/db/schema'
import { getPatterns } from './get-patterns'

const mockFrom = jest.fn()

jest.mock('@/services/database/db', () => ({
  getDrizzleDb: jest.fn(() => ({
    select: () => ({
      from: mockFrom,
    }),
  })),
}))

function makePattern(overrides: Partial<Pattern>): Pattern {
  return {
    id: 1,
    name: 'test-pattern',
    groupingPattern: 'test grouping',
    extractionPattern: 'test extraction',
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

describe('getPatterns', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns empty arrays when no patterns exist', async () => {
    mockFrom.mockResolvedValueOnce([])

    const result = await getPatterns()

    expect(result).toEqual({ active: [], rejected: [] })
  })

  it('separates active and rejected patterns', async () => {
    const patterns: Pattern[] = [
      makePattern({ id: 1, status: 'approved', isActive: true }),
      makePattern({ id: 2, status: 'rejected', isActive: true }),
      makePattern({ id: 3, status: 'needs-review', isActive: true }),
      makePattern({ id: 4, status: 'approved', isActive: false }),
    ]
    mockFrom.mockResolvedValueOnce(patterns)

    const result = await getPatterns()

    expect(result.active).toHaveLength(2)
    expect(result.active.map((p) => p.id)).toEqual([1, 3])
    expect(result.rejected).toHaveLength(1)
    expect(result.rejected[0].id).toBe(2)
  })

  it('excludes inactive non-rejected patterns from active list', async () => {
    const patterns: Pattern[] = [
      makePattern({ id: 1, status: 'approved', isActive: false }),
      makePattern({ id: 2, status: 'needs-review', isActive: false }),
    ]
    mockFrom.mockResolvedValueOnce(patterns)

    const result = await getPatterns()

    expect(result.active).toHaveLength(0)
    expect(result.rejected).toHaveLength(0)
  })

  it('includes rejected patterns regardless of isActive', async () => {
    const patterns: Pattern[] = [
      makePattern({ id: 1, status: 'rejected', isActive: true }),
      makePattern({ id: 2, status: 'rejected', isActive: false }),
    ]
    mockFrom.mockResolvedValueOnce(patterns)

    const result = await getPatterns()

    expect(result.active).toHaveLength(0)
    expect(result.rejected).toHaveLength(2)
  })

  it('returns empty arrays on database error', async () => {
    mockFrom.mockRejectedValueOnce(new Error('DB error'))

    const result = await getPatterns()

    expect(result).toEqual({ active: [], rejected: [] })
  })
})
