import { NativeModule, requireNativeModule } from 'expo'
import { PermissionResult, RoseSmsReaderModuleEvents, SMSReadOptions, SMSReadResult } from './RoseSmsReader.types'

declare class RoseSmsReaderModule extends NativeModule<RoseSmsReaderModuleEvents> {
  checkSMSPermission(): Promise<PermissionResult>
  requestSMSPermission(): Promise<PermissionResult>
  readSMS(options: SMSReadOptions): Promise<SMSReadResult>
  isAvailable(): Promise<boolean>
}

// This call loads the native module object from the JSI.
export default requireNativeModule<RoseSmsReaderModule>('RoseSmsReader')
