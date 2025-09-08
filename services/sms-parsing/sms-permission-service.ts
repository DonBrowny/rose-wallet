import { Alert, Platform } from 'react-native'

export interface PermissionResult {
  granted: boolean
  canAskAgain: boolean
  message: string
}

export class SMSPermissionService {
  /**
   * Check if SMS permission is granted
   * For prototype purposes, we'll simulate permission status
   */
  static async checkPermission(): Promise<PermissionResult> {
    if (Platform.OS !== 'android') {
      return {
        granted: false,
        canAskAgain: false,
        message: 'SMS reading is only supported on Android devices',
      }
    }

    // For prototype, we'll simulate that permission is available
    // In a real app, you'd use react-native-permissions or expo-permissions
    return {
      granted: true,
      canAskAgain: true,
      message: 'SMS permission is available (prototype mode)',
    }
  }

  /**
   * Request SMS permission from user
   * For prototype purposes, we'll simulate permission request
   */
  static async requestPermission(): Promise<PermissionResult> {
    if (Platform.OS !== 'android') {
      return {
        granted: false,
        canAskAgain: false,
        message: 'SMS reading is only supported on Android devices',
      }
    }

    // For prototype, we'll simulate permission granted
    return {
      granted: true,
      canAskAgain: true,
      message: 'SMS permission granted (prototype mode)',
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

    return await this.requestPermission()
  }
}
