import { NativeModule, registerWebModule } from 'expo'
import { PermissionResult, SMSReadOptions, SMSReadResult } from './RoseSmsReader.types'

class RoseSmsReaderModule extends NativeModule {
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

  async readSMS(
    options: SMSReadOptions = {
      startTimestamp: 0,
      endTimestamp: 0,
      senderNumbers: [],
      includeRead: true,
    }
  ): Promise<SMSReadResult> {
    return {
      messages: [],
    }
  }

  async isAvailable(): Promise<boolean> {
    return false
  }
}

export default registerWebModule(RoseSmsReaderModule, 'RoseSmsReaderModule')
