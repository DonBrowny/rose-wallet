import { Alert, Platform } from 'react-native'
import { checkSMSPermission, requestSMSPermission } from 'rose-sms-reader'
import { SMSPermissionService } from './sms-permission-service'

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  Alert: { alert: jest.fn() },
}))

jest.mock('rose-sms-reader', () => ({
  checkSMSPermission: jest.fn(),
  requestSMSPermission: jest.fn(),
}))

const checkPermissionMock = checkSMSPermission as unknown as jest.Mock
const requestPermissionMock = requestSMSPermission as unknown as jest.Mock

describe('SMSPermissionService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkPermission', () => {
    it('returns unsupported on non-android', async () => {
      ;(Platform as any).OS = 'ios'
      const res = await SMSPermissionService.checkPermission()
      expect(res).toEqual({
        granted: false,
        canAskAgain: false,
        message: 'SMS reading is only supported on Android devices',
      })
    })

    it('delegates to native check on android', async () => {
      ;(Platform as any).OS = 'android'
      checkPermissionMock.mockResolvedValueOnce({ granted: true, canAskAgain: true, message: 'ok' })
      const res = await SMSPermissionService.checkPermission()
      expect(checkPermissionMock).toHaveBeenCalled()
      expect(res).toEqual({ granted: true, canAskAgain: true, message: 'ok' })
    })

    it('returns formatted error on exception', async () => {
      ;(Platform as any).OS = 'android'
      checkPermissionMock.mockRejectedValueOnce(new Error('boom'))
      const res = await SMSPermissionService.checkPermission()
      expect(res.granted).toBe(false)
      expect(res.canAskAgain).toBe(false)
      expect(res.message).toContain('Error checking SMS permission:')
    })
  })

  describe('requestPermission', () => {
    it('returns unsupported on non-android', async () => {
      ;(Platform as any).OS = 'ios'
      const res = await SMSPermissionService.requestPermission()
      expect(res).toEqual({
        granted: false,
        canAskAgain: false,
        message: 'SMS reading is only supported on Android devices',
      })
    })

    it('delegates to native request on android', async () => {
      ;(Platform as any).OS = 'android'
      requestPermissionMock.mockResolvedValueOnce({ granted: true, canAskAgain: true, message: 'ok' })
      const res = await SMSPermissionService.requestPermission()
      expect(requestPermissionMock).toHaveBeenCalled()
      expect(res).toEqual({ granted: true, canAskAgain: true, message: 'ok' })
    })

    it('returns formatted error on exception', async () => {
      ;(Platform as any).OS = 'android'
      requestPermissionMock.mockRejectedValueOnce(new Error('boom'))
      const res = await SMSPermissionService.requestPermission()
      expect(res.granted).toBe(false)
      expect(res.canAskAgain).toBe(false)
      expect(res.message).toContain('Error requesting SMS permission:')
    })
  })

  describe('showPermissionExplanation', () => {
    it('resolves false when Cancel pressed', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')
      const promise = SMSPermissionService.showPermissionExplanation()
      // Extract and invoke Cancel onPress
      const [, , buttons] = alertSpy.mock.calls[0]
      const cancel = (buttons as any)[0]
      cancel.onPress()
      await expect(promise).resolves.toBe(false)
    })

    it('resolves true when Grant pressed', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')
      const promise = SMSPermissionService.showPermissionExplanation()
      const [, , buttons] = alertSpy.mock.calls[0]
      const grant = (buttons as any)[1]
      grant.onPress()
      await expect(promise).resolves.toBe(true)
    })
  })

  describe('showPermissionDeniedDialog', () => {
    it('shows an alert', () => {
      const alertSpy = jest.spyOn(Alert, 'alert')
      SMSPermissionService.showPermissionDeniedDialog()
      expect(alertSpy).toHaveBeenCalled()
    })
  })

  describe('requestPermissionWithExplanation', () => {
    it('returns immediately when permission already granted', async () => {
      jest.spyOn(SMSPermissionService, 'checkPermission').mockResolvedValueOnce({
        granted: true,
        canAskAgain: true,
        message: 'ok',
      })
      const res = await SMSPermissionService.requestPermissionWithExplanation()
      expect(res.granted).toBe(true)
    })

    it('shows denied dialog when cannot ask again', async () => {
      const check = jest.spyOn(SMSPermissionService, 'checkPermission').mockResolvedValueOnce({
        granted: false,
        canAskAgain: false,
        message: 'no-ask',
      })
      const deniedSpy = jest.spyOn(SMSPermissionService, 'showPermissionDeniedDialog').mockImplementation(() => {})
      const res = await SMSPermissionService.requestPermissionWithExplanation()
      expect(check).toHaveBeenCalled()
      expect(deniedSpy).toHaveBeenCalled()
      expect(res).toEqual({ granted: false, canAskAgain: false, message: 'no-ask' })
    })

    it('returns user-declined when explanation rejected', async () => {
      jest.spyOn(SMSPermissionService, 'checkPermission').mockResolvedValueOnce({
        granted: false,
        canAskAgain: true,
        message: '',
      })
      jest.spyOn(SMSPermissionService, 'showPermissionExplanation').mockResolvedValueOnce(false)
      const res = await SMSPermissionService.requestPermissionWithExplanation()
      expect(res).toEqual({ granted: false, canAskAgain: true, message: 'User declined to grant SMS permission' })
    })

    it('returns granted when native request succeeds', async () => {
      jest.spyOn(SMSPermissionService, 'checkPermission').mockResolvedValueOnce({
        granted: false,
        canAskAgain: true,
        message: '',
      })
      jest.spyOn(SMSPermissionService, 'showPermissionExplanation').mockResolvedValueOnce(true)
      jest.spyOn(SMSPermissionService, 'requestPermission').mockResolvedValueOnce({
        granted: true,
        canAskAgain: true,
        message: 'ok',
      })
      const res = await SMSPermissionService.requestPermissionWithExplanation()
      expect(res).toEqual({ granted: true, canAskAgain: true, message: 'ok' })
    })

    it('rechecks after failed request and returns recheck when granted', async () => {
      jest.useFakeTimers()
      const check = jest.spyOn(SMSPermissionService, 'checkPermission')
      check.mockResolvedValueOnce({ granted: false, canAskAgain: true, message: '' })
      jest.spyOn(SMSPermissionService, 'showPermissionExplanation').mockResolvedValueOnce(true)
      jest.spyOn(SMSPermissionService, 'requestPermission').mockResolvedValueOnce({
        granted: false,
        canAskAgain: true,
        message: '',
      })
      check.mockResolvedValueOnce({ granted: true, canAskAgain: true, message: 'ok' })

      const promise = SMSPermissionService.requestPermissionWithExplanation()
      await jest.advanceTimersByTimeAsync(1000)
      const res = await promise
      expect(res).toEqual({ granted: true, canAskAgain: true, message: 'ok' })
      jest.useRealTimers()
    })

    it('shows denied dialog after failed request and failed recheck', async () => {
      jest.useFakeTimers()
      const check = jest.spyOn(SMSPermissionService, 'checkPermission')
      check.mockResolvedValueOnce({ granted: false, canAskAgain: true, message: '' })
      jest.spyOn(SMSPermissionService, 'showPermissionExplanation').mockResolvedValueOnce(true)
      jest.spyOn(SMSPermissionService, 'requestPermission').mockResolvedValueOnce({
        granted: false,
        canAskAgain: true,
        message: '',
      })
      check.mockResolvedValueOnce({ granted: false, canAskAgain: false, message: 'still no' })
      const deniedSpy = jest.spyOn(SMSPermissionService, 'showPermissionDeniedDialog').mockImplementation(() => {})

      const promise = SMSPermissionService.requestPermissionWithExplanation()
      await jest.advanceTimersByTimeAsync(1000)
      const res = await promise
      expect(deniedSpy).toHaveBeenCalled()
      expect(res).toEqual({ granted: false, canAskAgain: true, message: '' })
      jest.useRealTimers()
    })
  })
})
