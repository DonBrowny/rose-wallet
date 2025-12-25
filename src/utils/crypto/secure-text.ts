import { MMKV_KEYS } from '@/types/mmkv-keys'
import { storage } from '@/utils/mmkv/storage'
import { Buffer } from 'buffer'
import crypto from 'react-native-quick-crypto'

const IV_LENGTH = 12
export const LEGACY_SECRET = 'rose-wallet-aes-secret'

function deriveKey(secret: string) {
  return crypto.createHash('sha256').update(secret).digest() as unknown as Buffer
}

export function generateSecret() {
  return crypto.randomBytes(32).toString('hex')
}

export function getEncryptionSecret() {
  return storage.getString(MMKV_KEYS.APP.SMS_SECRET)
}

export function setEncryptionSecret(secret: string) {
  storage.set(MMKV_KEYS.APP.SMS_SECRET, secret)
}

export function encryptTextWithSecret(plain: string, secret: string): string {
  if (!plain) return ''
  const key = deriveKey(secret)
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`
}

export function decryptTextWithSecret(enc: string, secret: string): string {
  if (!enc) return ''
  const [ivHex, tagHex, ctHex] = enc.split(':')
  if (!ivHex || !tagHex || !ctHex) {
    throw new Error('Invalid encrypted text format')
  }
  const key = deriveKey(secret)
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const ct = Buffer.from(ctHex, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const dec = Buffer.concat([decipher.update(ct), decipher.final()])
  return dec.toString('utf8')
}

export function encryptText(plain: string) {
  const secret = getEncryptionSecret()
  if (!secret) {
    throw new Error('Encryption secret not configured. Run migration first.')
  }
  return encryptTextWithSecret(plain, secret)
}

export function decryptText(enc: string) {
  const secret = getEncryptionSecret()
  if (!secret) {
    throw new Error('Encryption secret not configured. Run migration first.')
  }
  return decryptTextWithSecret(enc, secret)
}
