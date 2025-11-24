import { smsMessages } from '@/db/schema'
import { encryptText } from '@/utils/crypto/secure-text'
import { and, eq } from 'drizzle-orm'
import { getDrizzleDb } from './db'

export interface InsertEncryptedSmsInput {
  sender: string
  body: string
  date: number
}

export async function insertEncryptedSms(input: InsertEncryptedSmsInput): Promise<number> {
  const db = getDrizzleDb()
  const dateObj = new Date(input.date)
  await db.insert(smsMessages).values({
    sender: encryptText(input.sender),
    body: encryptText(input.body),
    dateTime: dateObj,
  })
  const rows = await db
    .select()
    .from(smsMessages)
    .where(and(eq(smsMessages.dateTime, dateObj)))
  return rows[0]?.id as number
}
