// Lightweight MurmurHash3 (x86, 32-bit) implementation
// Returns lowercase hex string (8 chars)

export function murmurHash32(input: string, seed: number = 0): string {
  let h1 = seed >>> 0
  const c1 = 0xcc9e2d51
  const c2 = 0x1b873593

  const str = String(input)
  const len = str.length
  const roundedEnd = len & ~0x3

  for (let i = 0; i < roundedEnd; i += 4) {
    let k1 =
      (str.charCodeAt(i) & 0xff) |
      ((str.charCodeAt(i + 1) & 0xff) << 8) |
      ((str.charCodeAt(i + 2) & 0xff) << 16) |
      ((str.charCodeAt(i + 3) & 0xff) << 24)

    k1 = Math.imul(k1, c1)
    k1 = (k1 << 15) | (k1 >>> 17)
    k1 = Math.imul(k1, c2)

    h1 ^= k1
    h1 = (h1 << 13) | (h1 >>> 19)
    h1 = Math.imul(h1, 5) + 0xe6546b64
  }

  let k1 = 0
  switch (len & 3) {
    case 3:
      k1 ^= (str.charCodeAt(roundedEnd + 2) & 0xff) << 16
    // fallthrough
    case 2:
      k1 ^= (str.charCodeAt(roundedEnd + 1) & 0xff) << 8
    // fallthrough
    case 1:
      k1 ^= str.charCodeAt(roundedEnd) & 0xff
      k1 = Math.imul(k1, c1)
      k1 = (k1 << 15) | (k1 >>> 17)
      k1 = Math.imul(k1, c2)
      h1 ^= k1
  }

  h1 ^= len
  h1 ^= h1 >>> 16
  h1 = Math.imul(h1, 0x85ebca6b)
  h1 ^= h1 >>> 13
  h1 = Math.imul(h1, 0xc2b2ae35)
  h1 ^= h1 >>> 16

  // Convert to 8-char hex string
  return (h1 >>> 0).toString(16).padStart(8, '0')
}
