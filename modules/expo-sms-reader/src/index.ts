import { PermissionResult, SMSReadOptions, SMSReadResult } from './ExpoSmsReader.types'
import ExpoSmsReaderModule from './ExpoSmsReaderModule'

export function checkSMSPermission(): Promise<PermissionResult> {
  return ExpoSmsReaderModule.checkSMSPermission()
}

export function requestSMSPermission(): Promise<PermissionResult> {
  return ExpoSmsReaderModule.requestSMSPermission()
}

export function readSMS(options: SMSReadOptions): Promise<SMSReadResult> {
  return ExpoSmsReaderModule.readSMS(options)
}

export function isAvailable(): Promise<boolean> {
  return ExpoSmsReaderModule.isAvailable()
}
