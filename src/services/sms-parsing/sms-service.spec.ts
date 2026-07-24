import { SMSPermissionService } from './sms-permission-service'
import { SMSReaderService } from './sms-reader-service'
import { SMSService } from './sms-service'

jest.mock('./sms-permission-service', () => ({
  SMSPermissionService: {
    requestPermissionWithExplanation: jest.fn(),
  },
}))

jest.mock('./sms-reader-service', () => ({
  SMSReaderService: {
    readSMS: jest.fn(),
  },
}))

describe('SMSService', () => {
  const permissionSvc = SMSPermissionService as jest.Mocked<typeof SMSPermissionService>
  const readerSvc = SMSReaderService as jest.Mocked<typeof SMSReaderService>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTransactionalSMS', () => {
    it('returns failure when permission denied', async () => {
      permissionSvc.requestPermissionWithExplanation.mockResolvedValueOnce({
        granted: false,
        canAskAgain: false,
        message: 'Denied',
      })

      const res = await SMSService.getTransactionalSMS({ startTimestamp: 1, endTimestamp: 2 })
      expect(res.success).toBe(false)
      expect(res.sms).toEqual([])
      expect(res.errors).toEqual(['Denied'])
    })

    it('returns failure when readSMS fails', async () => {
      permissionSvc.requestPermissionWithExplanation.mockResolvedValueOnce({
        granted: true,
        canAskAgain: true,
        message: '',
      })
      readerSvc.readSMS.mockResolvedValueOnce({
        success: false,
        messages: [],
        error: 'read error',
        totalCount: 0,
      })

      const res = await SMSService.getTransactionalSMS({ startTimestamp: 1, endTimestamp: 2 })
      expect(res.success).toBe(false)
      expect(res.errors).toEqual(['read error'])
    })

    it('filters messages to transactional senders', async () => {
      permissionSvc.requestPermissionWithExplanation.mockResolvedValueOnce({
        granted: true,
        canAskAgain: true,
        message: '',
      })
      readerSvc.readSMS.mockResolvedValueOnce({
        success: true,
        totalCount: 3,
        messages: [
          { id: '1', body: 'bank sms', address: 'AD-HDFCBK-T', date: 1, read: true, type: 1 },
          { id: '2', body: 'personal sms', address: '+919876543210', date: 2, read: true, type: 1 },
          { id: '3', body: 'service sms', address: 'BZ-SBIINB-S', date: 3, read: true, type: 1 },
        ],
      })

      const res = await SMSService.getTransactionalSMS({ startTimestamp: 1, endTimestamp: 2 })
      expect(res.success).toBe(true)
      expect(res.totalSMSRead).toBe(3)
      expect(res.filteredSMSCount).toBe(2)
      expect(res.sms.map((s) => s.id)).toEqual(['1', '3'])
    })

    it('handles unexpected errors', async () => {
      permissionSvc.requestPermissionWithExplanation.mockImplementationOnce(() => {
        throw new Error('boom')
      })

      const res = await SMSService.getTransactionalSMS({ startTimestamp: 1, endTimestamp: 2 })
      expect(res.success).toBe(false)
      expect(res.errors[0]).toContain('Unexpected error: boom')
    })
  })
})
