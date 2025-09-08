import {
  checkSMSPermission as expoCheckPermission,
  requestSMSPermission as expoRequestPermission,
} from 'expo-sms-reader'
import { Alert, Platform } from 'react-native'

export interface PermissionResult {
  granted: boolean
  canAskAgain: boolean
  message: string
}

export class SMSPermissionService {
  /**
   * Check if SMS permission is granted
   */
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

  /**
   * Request SMS permission from user
   */
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

  /**
   * Show permission explanation dialog
   */
  static showPermissionExplanation(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'SMS Permission Required',
        'This app needs SMS permission to automatically track your expenses from bank messages. We only read transaction-related SMS and never share your data.',
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

  /**
   * Show permission denied dialog with settings option
   */
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

  /**
   * Complete permission flow with user interaction
   */
  static async requestPermissionWithExplanation(): Promise<PermissionResult> {
    // First check current status
    const currentStatus = await this.checkPermission()

    if (currentStatus.granted) {
      return currentStatus
    }

    if (!currentStatus.canAskAgain) {
      this.showPermissionDeniedDialog()
      return currentStatus
    }

    // Show explanation and request permission
    const userWantsToGrant = await this.showPermissionExplanation()

    if (!userWantsToGrant) {
      return {
        granted: false,
        canAskAgain: true,
        message: 'User declined to grant SMS permission',
      }
    }

    // Request permission
    const result = await this.requestPermission()

    // After requesting, check again to see if permission was actually granted
    if (!result.granted) {
      // Wait a moment for the permission dialog to complete
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check permission status again
      const recheckResult = await this.checkPermission()

      if (recheckResult.granted) {
        return recheckResult
      }

      this.showPermissionDeniedDialog()
    }

    return result
  }
}
