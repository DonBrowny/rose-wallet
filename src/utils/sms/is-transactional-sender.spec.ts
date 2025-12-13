import { isTransactionalSender } from './is-transactional-sender'

describe('isTransactionalSender', () => {
  describe('transactional suffix (-T)', () => {
    it('returns true for transactional senders', () => {
      expect(isTransactionalSender('AD-HDFCBK-T')).toBe(true)
      expect(isTransactionalSender('BZ-SBIINB-T')).toBe(true)
      expect(isTransactionalSender('DL-SWIGGY-T')).toBe(true)
      expect(isTransactionalSender('MH-AMAZON-T')).toBe(true)
    })

    it('returns true for lowercase format', () => {
      expect(isTransactionalSender('ad-hdfcbk-t')).toBe(true)
      expect(isTransactionalSender('bz-sbiinb-t')).toBe(true)
    })
  })

  describe('service suffix (-S)', () => {
    it('returns true for service senders', () => {
      expect(isTransactionalSender('AD-HDFCBK-S')).toBe(true)
      expect(isTransactionalSender('BZ-SBIINB-S')).toBe(true)
      expect(isTransactionalSender('DL-PAYTMB-S')).toBe(true)
    })

    it('returns true for lowercase format', () => {
      expect(isTransactionalSender('ad-hdfcbk-s')).toBe(true)
    })
  })

  describe('excluded suffixes', () => {
    it('returns false for promotional suffix (-P)', () => {
      expect(isTransactionalSender('AD-HDFCBK-P')).toBe(false)
      expect(isTransactionalSender('BZ-SBIINB-P')).toBe(false)
    })

    it('returns false for government suffix (-G)', () => {
      expect(isTransactionalSender('AD-ICICIB-G')).toBe(false)
      expect(isTransactionalSender('DL-GOVTIN-G')).toBe(false)
    })
  })

  describe('invalid formats', () => {
    it('returns false for wrong length entity code', () => {
      expect(isTransactionalSender('AD-HDFC-T')).toBe(false) // 4 chars
      expect(isTransactionalSender('AD-HDFCBANK-T')).toBe(false) // 8 chars
    })

    it('returns false for wrong length circle code', () => {
      expect(isTransactionalSender('A-HDFCBK-T')).toBe(false) // 1 char
      expect(isTransactionalSender('ADD-HDFCBK-T')).toBe(false) // 3 chars
    })

    it('returns false for missing suffix', () => {
      expect(isTransactionalSender('AD-HDFCBK')).toBe(false)
      expect(isTransactionalSender('AD-HDFCBK-')).toBe(false)
    })

    it('returns false for old format without circle code', () => {
      expect(isTransactionalSender('HDFCBK-T')).toBe(false)
      expect(isTransactionalSender('SBIINB-S')).toBe(false)
    })

    it('returns false for other invalid formats', () => {
      expect(isTransactionalSender('+919876543210')).toBe(false)
      expect(isTransactionalSender('SPAM')).toBe(false)
    })

    it('handles edge cases', () => {
      expect(isTransactionalSender('')).toBe(false)
      expect(isTransactionalSender('   ')).toBe(false)
      expect(isTransactionalSender(null as unknown as string)).toBe(false)
      expect(isTransactionalSender(undefined as unknown as string)).toBe(false)
    })
  })

  describe('whitespace handling', () => {
    it('trims whitespace from input', () => {
      expect(isTransactionalSender('  AD-HDFCBK-T  ')).toBe(true)
      expect(isTransactionalSender('\tBZ-SBIINB-S\n')).toBe(true)
    })
  })
})
