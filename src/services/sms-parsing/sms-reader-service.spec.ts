import { Platform } from 'react-native'
import { isAvailable, readSMS } from 'rose-sms-reader'
import { SMSReaderService } from './sms-reader-service'

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}))

jest.mock('rose-sms-reader', () => ({
  isAvailable: jest.fn(),
  readSMS: jest.fn(),
}))

const isAvailableMock = isAvailable as unknown as jest.Mock
const readSMSMock = readSMS as unknown as jest.Mock

describe('SMSReaderService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('isReaderAvailable', () => {
    it('returns false on non-android', async () => {
      ;(Platform as any).OS = 'ios'
      expect(await SMSReaderService.isReaderAvailable()).toBe(false)
    })

    it('delegates to `isAvailable` on android', async () => {
      ;(Platform as any).OS = 'android'
      isAvailableMock.mockResolvedValueOnce(true)
      await expect(SMSReaderService.isReaderAvailable()).resolves.toBe(true)
      expect(isAvailableMock).toHaveBeenCalled()
    })
  })

  describe('readSMS', () => {
    it('returns failure when reader is unavailable', async () => {
      ;(Platform as any).OS = 'ios'
      const res = await SMSReaderService.readSMS({ startTimestamp: 1, endTimestamp: 2 })
      expect(res.success).toBe(false)
      expect(res.messages).toEqual([])
      expect(res.totalCount).toBe(0)
      expect(res.error).toMatch('not available')
    })

    it('reads messages and trims bodies on success', async () => {
      ;(Platform as any).OS = 'android'
      isAvailableMock.mockResolvedValueOnce(true)
      readSMSMock.mockResolvedValueOnce({
        messages: [
          { id: '1', body: '  hello  ', address: 'a', date: 1, read: true, type: 0 },
          { id: '2', body: 'world', address: 'b', date: 2, read: false, type: 0 },
        ],
      })

      const res = await SMSReaderService.readSMS({ startTimestamp: 1, endTimestamp: 2 })
      expect(res.success).toBe(true)
      expect(res.totalCount).toBe(2)
      expect(res.messages[0].body).toBe('hello')
      expect(res.messages[1].body).toBe('world')
      expect(readSMSMock).toHaveBeenCalledWith({
        startTimestamp: 1,
        endTimestamp: 2,
        senderNumbers: [],
        includeRead: true,
      })
    })

    it('propagates failure with formatted error message', async () => {
      ;(Platform as any).OS = 'android'
      isAvailableMock.mockResolvedValueOnce(true)
      readSMSMock.mockRejectedValueOnce(new Error('boom'))

      const res = await SMSReaderService.readSMS({ startTimestamp: 1, endTimestamp: 2 })
      expect(res.success).toBe(false)
      expect(res.messages).toEqual([])
      expect(res.totalCount).toBe(0)
      expect(res.error).toContain('Failed to read SMS:')
    })
  })

  describe('createLastNDaysRange', () => {
    it('produces deterministic range based on now', () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-01-31T12:00:00.000Z'))

      const { startTimestamp, endTimestamp } = SMSReaderService.createLastNDaysRange(7)
      const start = new Date(startTimestamp)
      const end = new Date(endTimestamp)

      expect(end.toISOString().slice(0, 10)).toBe('2025-01-31')
      expect(start.toISOString().slice(0, 10)).toBe('2025-01-24')

      jest.useRealTimers()
    })
  })
})
