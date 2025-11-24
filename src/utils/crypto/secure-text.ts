import { Buffer } from 'buffer'
import crypto from 'react-native-quick-crypto'

// NOTE:
// - In production, derive and store this key securely (Android Keystore / iOS Keychain).
// - Here we derive a 32-byte key from a passphrase using SHA-256 for simplicity.
const SECRET = 'rose-wallet-aes-secret'
const KEY = crypto.createHash('sha256').update(SECRET).digest()
const IV_LENGTH = 12

export function encryptText(plain: string): string {
  if (!plain) return ''
  try {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv)
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`
  } catch (e) {
    console.error('encryptText failed', plain, e)
    return ''
  }
}

export function decryptText(enc: string): string {
  if (!enc) return ''
  try {
    const [ivHex, tagHex, ctHex] = enc.split(':')
    if (!ivHex || !tagHex || !ctHex) return ''
    const iv = Buffer.from(ivHex, 'hex')
    const tag = Buffer.from(tagHex, 'hex')
    const ct = Buffer.from(ctHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv)
    decipher.setAuthTag(tag)
    const dec = Buffer.concat([decipher.update(ct), decipher.final()])
    return dec.toString('utf8')
  } catch (e) {
    console.error('decryptText failed', enc, e)
    return ''
  }
}
