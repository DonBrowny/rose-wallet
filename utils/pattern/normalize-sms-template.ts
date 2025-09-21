// sms-skeleton.ts
const PROTECTED = ['UPI', 'IMPS', 'NEFT', 'RTGS', 'POS', 'ATM', 'NETBANKING', 'OTP', 'EMI', 'SI', 'AUTO-PAY', 'AUTOPAY']

const RX_CUR = /(?:₹|rs\.?|inr)/i
const RX_NUM = /\d{1,3}(?:,\d{2,3})*(?:\.\d+)?|\d+(?:\.\d+)?/ // Indian + generic
const RX_AMOUNT = new RegExp(`(?:${RX_CUR.source})\\s*${RX_NUM.source}|${RX_NUM.source}\\s*(?:${RX_CUR.source})`, 'gi')

const RX_BAL_CUE = /\b(avl\.?\s*bal|available\s*balance|ledger\s*balance|bal\.?)\b/gi
const RX_VPA = /\b[a-z0-9._-]{2,}@[a-z]{2,}\b/gi
const RX_LAST4_MASK = /(?:\*{2,}|x{2,})\s*\d{2,6}/gi
const RX_LAST4_BARE = /\b\d{4}\b/g // used only near account/card words
const RX_ACCOUNT_WORD = /\b(a\/c|acct|account|card)\b/i

const RX_DATE = /\b(?:\d{1,2}[\/\-](?:\d{1,2}|[A-Za-z]{3,9})(?:[\/\-]\d{2,4})?|\d{1,2}[:.]\d{2}\s?(?:am|pm)?)\b/gi

const RX_REF = /\b(?=[A-Z0-9]{10,22}\b)(?=.*[A-Z])[A-Z0-9]{10,22}\b/gi // alnum with at least one letter
const RX_REF_NUM = /\b\d{12,}\b/g // numeric references like RRN

const RX_SENDER = /\b(?:[A-Z]{2}-)?[A-Z]{2,8}BK\b/g // rough "VM-HDFCBK" etc (optional)

// Contextual merchant: after "at / to / from"
const RX_MERCH_CTX = /\b(?:at|to|from)\s+([A-Z][A-Za-z0-9 &._-]{2,})/g

export function normalizeSMSTemplate(sms: string): string {
  if (!sms) return ''

  let s = sms
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // 1) Sender codes (optional)
  s = s.replace(RX_SENDER, '<SENDER>')

  // 2) Balance cue first, so we can later tag the number after it as <BAL>
  s = s.replace(RX_BAL_CUE, '<BAL_CUE>')

  // 3) UPI / account markers
  s = s.replace(RX_VPA, '<VPA>')
  s = s.replace(RX_LAST4_MASK, '<LAST4>')

  // 4) Currency+amount (keep currency tokenized)
  s = s.replace(RX_AMOUNT, (m) => {
    // ensure we keep <CUR><AMT> order
    const hasCurFirst = new RegExp(`^${RX_CUR.source}`, 'i').test(m)
    return hasCurFirst ? '<CUR><AMT>' : '<AMT><CUR>'
  })

  // 5) Balance numbers right after the cue
  //    Replace "<BAL_CUE> ... <NUM>" → "<BAL_CUE> <CUR><BAL>" or "<BAL>"
  s = s.replace(
    /<BAL_CUE>\s*(?:<CUR>)?\s*(?:<AMT>|(\d{1,3}(?:,\d{2,3})*(?:\.\d+)?|\d+(?:\.\d+)?))/gi,
    (_m, numOnly) => `<BAL_CUE> ${/^\d/.test(String(numOnly)) ? '<BAL>' : '<CUR><BAL>'}`
  )

  // 6) Contextual merchant replacement (protect banking keywords)
  s = s.replace(RX_MERCH_CTX, (m, name) => {
    const token = String(name).trim()
    const isProtected = PROTECTED.some((p) => token.toUpperCase().includes(p))
    return isProtected ? m : m.replace(token, '<MERCH>')
  })

  // 7) Reference IDs
  s = s.replace(RX_REF, '<REF>')
  s = s.replace(RX_REF_NUM, (m) => (m.length >= 12 ? '<REF>' : m))

  // 8) Remaining 4-digit numbers labeled as LAST4 only in account/card context
  s = s.replace(new RegExp(`${RX_ACCOUNT_WORD.source}\\s*${RX_LAST4_BARE.source}`, 'gi'), (m) =>
    m.replace(RX_LAST4_BARE, '<LAST4>')
  )

  // 9) Dates/times
  s = s.replace(RX_DATE, '<DATE>')

  // 10) Collapse leftover pure numbers that aren’t already tagged → <NUM>
  s = s.replace(/\b\d{1,3}(?:,\d{2,3})*(?:\.\d+)?\b/g, '<NUM>')

  // 11) Normalize spaces/punctuation
  s = s
    .replace(/\s+/g, ' ')
    .replace(/\s([,.])/g, '$1')
    .trim()

  return s
}
