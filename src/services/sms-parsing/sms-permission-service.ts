import { Alert, Platform } from 'react-native'
import {
  checkSMSPermission as expoCheckPermission,
  requestSMSPermission as expoRequestPermission,
  type PermissionResult,
} from 'rose-sms-reader'

export class SMSPermissionService {
  static async checkPermission(): Promise<PermissionResult> {
    if (Platform.OS !== 'android') {
      return {
        granted: false,
        canAskAgain: false,
        message: 'SMS reading is only supported on Android devices',
      }
    }

    try {
      const result = await expoCheckPermission()
      return {
        granted: result.granted,
        canAskAgain: result.canAskAgain,
        message: result.message,
      }
    } catch (error) {
      return {
        granted: false,
        canAskAgain: false,
        message: `Error checking SMS permission: ${error}`,
      }
    }
  }

  static async requestPermission(): Promise<PermissionResult> {
    if (Platform.OS !== 'android') {
      return {
        granted: false,
        canAskAgain: false,
        message: 'SMS reading is only supported on Android devices',
      }
    }

    try {
      const result = await expoRequestPermission()
      return {
        granted: result.granted,
        canAskAgain: result.canAskAgain,
        message: result.message,
      }
    } catch (error) {
      return {
        granted: false,
        canAskAgain: false,
        message: `Error requesting SMS permission: ${error}`,
      }
    }
  }

  static showPermissionExplanation(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'SMS Permission Required',
        'This app needs SMS permission to automatically track your expenses from bank messages. We never share your data.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Grant Permission',
            onPress: () => resolve(true),
          },
        ]
      )
    })
  }

  static showPermissionDeniedDialog(): void {
    Alert.alert(
      'Permission Required',
      'SMS permission is required to track expenses. Please enable it in your device settings.',
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    )
  }

  static async requestPermissionWithExplanation(): Promise<PermissionResult> {
    const currentStatus = await this.checkPermission()

    if (currentStatus.granted) {
      return currentStatus
    }

    if (!currentStatus.canAskAgain) {
      this.showPermissionDeniedDialog()
      return currentStatus
    }

    const userWantsToGrant = await this.showPermissionExplanation()

    if (!userWantsToGrant) {
      return {
        granted: false,
        canAskAgain: true,
        message: 'User declined to grant SMS permission',
      }
    }

    const result = await this.requestPermission()
    if (!result.granted) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const recheckResult = await this.checkPermission()

      if (recheckResult.granted) {
        return recheckResult
      }

      this.showPermissionDeniedDialog()
    }

    return result
  }
}
