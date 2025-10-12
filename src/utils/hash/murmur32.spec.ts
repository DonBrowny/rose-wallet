import { murmurHash32 } from './murmur32'

describe('murmurHash32', () => {
  it('returns 8-char lowercase hex string', () => {
    const h = murmurHash32('hello')
    expect(h).toMatch(/^[0-9a-f]{8}$/)
    expect(h).toHaveLength(8)
  })

  it('hashes empty string with seed 0 to 00000000', () => {
    expect(murmurHash32('')).toBe('00000000')
  })

  it('is deterministic for same input and seed', () => {
    const a = murmurHash32('rose-wallet', 42)
    const b = murmurHash32('rose-wallet', 42)
    expect(a).toBe(b)
  })

  it('changes when seed changes', () => {
    const a = murmurHash32('seeded input', 1)
    const b = murmurHash32('seeded input', 2)
    expect(a).not.toBe(b)
  })

  it('changes when input changes slightly', () => {
    const a = murmurHash32('abcdefg')
    const b = murmurHash32('abcdefh')
    expect(a).not.toBe(b)
  })

  it('handles long strings consistently', () => {
    const long = 'abc'.repeat(10000)
    const h1 = murmurHash32(long)
    const h2 = murmurHash32(long)
    expect(h1).toBe(h2)
    expect(h1).toMatch(/^[0-9a-f]{8}$/)
  })
})
