import { NativeModule, requireNativeModule } from 'expo'
import { ExpoSmsReaderModuleEvents, PermissionResult, SMSReadOptions, SMSReadResult } from './ExpoSmsReader.types'

declare class ExpoSmsReaderModule extends NativeModule<ExpoSmsReaderModuleEvents> {
  checkSMSPermission(): Promise<PermissionResult>
  requestSMSPermission(): Promise<PermissionResult>
  readSMS(options: SMSReadOptions): Promise<SMSReadResult>
  isAvailable(): Promise<boolean>
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoSmsReaderModule>('ExpoSmsReader')
