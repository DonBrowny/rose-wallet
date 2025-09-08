import { NativeModule, registerWebModule } from 'expo'
import { PermissionResult, SMSReadOptions, SMSReadResult } from './ExpoSmsReader.types'

class ExpoSmsReaderModule extends NativeModule {
  async checkSMSPermission(): Promise<PermissionResult> {
    return {
      granted: false,
      canAskAgain: false,
      message: 'SMS reading is only supported on Android devices',
    }
  }

  async requestSMSPermission(): Promise<PermissionResult> {
    return {
      granted: false,
      canAskAgain: false,
      message: 'SMS reading is only supported on Android devices',
    }
  }

  async readSMS(options: SMSReadOptions = {}): Promise<SMSReadResult> {
    return {
      messages: [],
    }
  }

  async isAvailable(): Promise<boolean> {
    return false
  }
}

export default registerWebModule(ExpoSmsReaderModule, 'ExpoSmsReaderModule')
