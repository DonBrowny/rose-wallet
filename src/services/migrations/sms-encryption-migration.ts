import { smsMessages } from '@/db/schema'
import { getDrizzleDb } from '@/services/database/db'
import {
  decryptTextWithSecret,
  encryptTextWithSecret,
  generateSecret,
  getEncryptionSecret,
  LEGACY_SECRET,
  setEncryptionSecret,
} from '@/utils/crypto/secure-text'
import { eq } from 'drizzle-orm'
import { Migration } from './migration-runner'

async function run(): Promise<void> {
  const db = getDrizzleDb()
  const smsCount = await db.select().from(smsMessages).limit(1)
  const hasSmsMessages = smsCount.length > 0

  const newSecret = generateSecret()

  if (!hasSmsMessages) {
    setEncryptionSecret(newSecret)
    return
  }

  const allSms = await db.select().from(smsMessages)

  await db.transaction(async (tx) => {
    for (const sms of allSms) {
      const decryptedSender = decryptTextWithSecret(sms.sender, LEGACY_SECRET)
      const decryptedBody = decryptTextWithSecret(sms.body, LEGACY_SECRET)

      const encryptedSender = encryptTextWithSecret(decryptedSender, newSecret)
      const encryptedBody = encryptTextWithSecret(decryptedBody, newSecret)

      await tx
        .update(smsMessages)
        .set({
          sender: encryptedSender,
          body: encryptedBody,
        })
        .where(eq(smsMessages.id, sms.id))
    }
  })
  setEncryptionSecret(newSecret)
}

export const smsEncryptionMigration: Migration = {
  id: 'sms-encryption-v1',
  name: 'SMS Encryption Migration',
  shouldRun: () => !getEncryptionSecret(),
  run,
}
