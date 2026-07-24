import { SMS_MATCH_STATUS, smsMessages, type SmsMatchStatus } from '@/db/schema'
import { decryptText, encryptText } from '@/utils/crypto/secure-text'
import { murmurHash32 } from '@/utils/hash/murmur32'
import { eq, inArray } from 'drizzle-orm'
import { getDrizzleDb } from './db'

export interface SmsInput {
  sender: string
  body: string
  date: number
}

export interface QueuedSms {
  id: number
  sender: string
  body: string
  date: number
}

export function computeSmsHash(input: SmsInput): string {
  return murmurHash32(`${input.sender}|${input.date}|${input.body}`)
}

/**
 * Persist an SMS that became an expense. Upserts on the content hash, so an SMS
 * already sitting in the unmatched queue is flipped to matched instead of duplicated.
 */
export async function insertEncryptedSms(input: SmsInput): Promise<number> {
  const db = getDrizzleDb()
  const smsHash = computeSmsHash(input)

  await db
    .insert(smsMessages)
    .values({
      sender: encryptText(input.sender),
      body: encryptText(input.body),
      dateTime: new Date(input.date),
      smsHash,
      matchStatus: SMS_MATCH_STATUS.Matched,
    })
    .onConflictDoUpdate({
      target: smsMessages.smsHash,
      set: { matchStatus: SMS_MATCH_STATUS.Matched },
    })

  const rows = await db.select().from(smsMessages).where(eq(smsMessages.smsHash, smsHash))
  return rows[0]?.id as number
}

/**
 * Add transaction-relevant SMS to the residual queue. Content-hash conflicts are
 * ignored, so re-scanning an overlapping time window is a no-op.
 */
export async function enqueueUnmatchedSms(inputs: SmsInput[]): Promise<void> {
  if (inputs.length === 0) return
  const db = getDrizzleDb()

  const rows = inputs.map((input) => ({
    sender: encryptText(input.sender),
    body: encryptText(input.body),
    dateTime: new Date(input.date),
    smsHash: computeSmsHash(input),
    matchStatus: SMS_MATCH_STATUS.Unmatched,
  }))

  await db.insert(smsMessages).values(rows).onConflictDoNothing({ target: smsMessages.smsHash })
}

/** The residual queue: SMS awaiting a pattern or user confirmation, decrypted. */
export async function getUnmatchedSms(): Promise<QueuedSms[]> {
  const db = getDrizzleDb()
  const rows = await db.select().from(smsMessages).where(eq(smsMessages.matchStatus, SMS_MATCH_STATUS.Unmatched))

  return rows.map((row) => ({
    id: row.id,
    sender: decryptText(row.sender),
    body: decryptText(row.body),
    date: row.dateTime.getTime(),
  }))
}

export async function updateSmsMatchStatusByIds(ids: number[], status: SmsMatchStatus): Promise<void> {
  if (ids.length === 0) return
  const db = getDrizzleDb()
  await db.update(smsMessages).set({ matchStatus: status }).where(inArray(smsMessages.id, ids))
}
