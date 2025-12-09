import { isTransactionalSender } from './is-transactional-sender'

describe('isTransactionalSender', () => {
  describe('transactional suffix (-T)', () => {
    it('returns true for transactional senders', () => {
      expect(isTransactionalSender('HDFCBK-T')).toBe(true)
      expect(isTransactionalSender('SBIINB-T')).toBe(true)
      expect(isTransactionalSender('SWIGGY-T')).toBe(true)
      expect(isTransactionalSender('AMAZON-T')).toBe(true)
    })

    it('returns true for lowercase format', () => {
      expect(isTransactionalSender('hdfcbk-t')).toBe(true)
      expect(isTransactionalSender('sbiinb-t')).toBe(true)
    })
  })

  describe('service suffix (-S)', () => {
    it('returns true for service senders', () => {
      expect(isTransactionalSender('HDFCBK-S')).toBe(true)
      expect(isTransactionalSender('SBIINB-S')).toBe(true)
      expect(isTransactionalSender('PAYTMB-S')).toBe(true)
    })

    it('returns true for lowercase format', () => {
      expect(isTransactionalSender('hdfcbk-s')).toBe(true)
    })
  })

  describe('excluded suffixes', () => {
    it('returns false for promotional suffix (-P)', () => {
      expect(isTransactionalSender('HDFCBK-P')).toBe(false)
      expect(isTransactionalSender('SBIINB-P')).toBe(false)
    })

    it('returns false for government suffix (-G)', () => {
      expect(isTransactionalSender('ICICIB-G')).toBe(false)
      expect(isTransactionalSender('GOVTIN-G')).toBe(false)
    })
  })

  describe('invalid formats', () => {
    it('returns false for wrong length entity code', () => {
      expect(isTransactionalSender('HDFC-T')).toBe(false) // 4 chars
      expect(isTransactionalSender('HDFCBANK-T')).toBe(false) // 8 chars
    })

    it('returns false for missing suffix', () => {
      expect(isTransactionalSender('HDFCBK')).toBe(false)
      expect(isTransactionalSender('HDFCBK-')).toBe(false)
    })

    it('returns false for other invalid formats', () => {
      expect(isTransactionalSender('+919876543210')).toBe(false)
      expect(isTransactionalSender('SPAM')).toBe(false)
      expect(isTransactionalSender('AD-HDFCBK')).toBe(false) // old format
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
      expect(isTransactionalSender('  HDFCBK-T  ')).toBe(true)
      expect(isTransactionalSender('\tSBIINB-S\n')).toBe(true)
    })
  })
})
