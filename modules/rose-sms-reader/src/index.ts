import { PermissionResult, SMSReadOptions, SMSReadResult } from './RoseSmsReader.types'
import RoseSmsReaderModule from './RoseSmsReaderModule'

export function checkSMSPermission(): Promise<PermissionResult> {
  return RoseSmsReaderModule.checkSMSPermission()
}

export function requestSMSPermission(): Promise<PermissionResult> {
  return RoseSmsReaderModule.requestSMSPermission()
}

export function readSMS(options: SMSReadOptions): Promise<SMSReadResult> {
  return RoseSmsReaderModule.readSMS(options)
}

export function isAvailable(): Promise<boolean> {
  return RoseSmsReaderModule.isAvailable()
}
