import type { SMSMessage } from '@/types/sms/transaction'
import { isTransactionalSender } from '@/utils/sms/is-transactional-sender'
import { SMSPermissionService } from './sms-permission-service'
import { SMSReaderService } from './sms-reader-service'

export interface TransactionSMSResult {
  success: boolean
  sms: SMSMessage[]
  totalSMSRead: number
  filteredSMSCount: number
  errors: string[]
}

export class SMSService {
  static async getTransactionalSMS(options: {
    startTimestamp: number
    endTimestamp: number
  }): Promise<TransactionSMSResult> {
    const { startTimestamp, endTimestamp } = options

    try {
      // Step 1: Check and request SMS permission
      const permissionResult = await SMSPermissionService.requestPermissionWithExplanation()

      if (!permissionResult.granted) {
        return {
          success: false,
          sms: [],
          totalSMSRead: 0,
          filteredSMSCount: 0,
          errors: [permissionResult.message],
        }
      }

      // Step 2: Read SMS messages
      const smsReadResult = await SMSReaderService.readSMS({
        startTimestamp,
        endTimestamp,
        includeRead: true,
      })

      if (!smsReadResult.success) {
        return {
          success: false,
          sms: [],
          totalSMSRead: 0,
          filteredSMSCount: 0,
          errors: [smsReadResult.error || 'Failed to read SMS messages'],
        }
      }

      // Step 3: Pre-filter to transactional/service SMS (format: XXXXXX-[TS])
      const transactionalMessages = (smsReadResult.messages || []).filter((sms) => isTransactionalSender(sms.address))
      return {
        success: true,
        sms: transactionalMessages,
        totalSMSRead: smsReadResult.totalCount,
        filteredSMSCount: transactionalMessages.length,
        errors: [],
      }
    } catch (error) {
      return {
        success: false,
        sms: [],
        totalSMSRead: 0,
        filteredSMSCount: 0,
        errors: [`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }
}
