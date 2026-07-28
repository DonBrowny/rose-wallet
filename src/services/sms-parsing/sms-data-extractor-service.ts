// Brain-2: Transaction Fields (rule-based)

import type { Intent } from '@/types/sms/transaction'

export interface TxnFields {
  isTransaction: boolean
  intent: Intent
  amount?: { value: number; currency: string; confidence: number }
  bank?: { name: string; confidence: number }
  merchant?: string // best-effort
  datetimeText?: string
  confidence: number

  // debug surface (optional; remove in prod)
  raw: {
    amounts: { text: string; value: number; start: number; end: number }[]
    balances: { text: string; value: number; start: number; end: number }[]
    refs: string[]
  }
}

export class SMSDataExtractorService {
  private static _instance: SMSDataExtractorService | null = null
  static getInstance() {
    return this._instance ?? (this._instance = new SMSDataExtractorService())
  }
  private constructor() {}

  private BANK_WORDS = [
    'hdfc',
    'icici',
    'sbi',
    'axis',
    'kotak',
    'yes bank',
    'federal',
    'idfc',
    'indusind',
    'canara',
    'union bank',
    'bob',
    'boi',
    'au small finance',
  ]

  // Numbers accept Indian comma grouping ("1,23,456") or plain digit runs ("10000") —
  // requiring the comma branch to have at least one group keeps plain runs whole.
  private RX_AMOUNT =
    /(?:(?:inr|rs\.?|₹)\s*)(?:\d{1,3}(?:,\d{2,3})+|\d+)(?:\.\d+)?|\b(?:\d{1,3}(?:,\d{2,3})+|\d+)(?:\.\d+)?\s*(?:inr|rs)\b|(?:debited|credited|paid|received|transferred|spent|withdrawn|deposited)\s+(?:by|of|for|to|from)?\s*((?:\d{1,3}(?:,\d{2,3})+|\d+)(?:\.\d+)?)/gi
  private RX_ANYNUM = /(?:\d{1,3}(?:,\d{2,3})+|\d+)(?:\.\d+)?/
  private RX_BALANCE_CUE = /\b(avl\.?\s*bal|available\s*balance|ledger\s*balance|bal\.?)\b/i
  private RX_UTR_RRN = /\b[0-9A-Z]{10,22}\b/g
  private RX_DATETIME =
    /\b(?:\d{1,2}[:.]\d{2}\s?(?:am|pm)?)|(?:\d{1,2}[\/\-][A-Za-z]{3,9}[\/\-]?\d{0,4})|(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(?:\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b\.?\s?\d{1,2}(?:,\s?\d{2,4})?)/gi
  // Lowercase-only: banks print VPAs in lowercase, and this keeps uppercase Info-blob prefixes
  // ("ICCL ZERODHA COIN-zerodhamf@hdfcbank") out of the handle; the alphanumeric first char
  // stops a leading blob dash from joining. Trailing (?!\.[a-z]) rejects e-mail domains
  // ("care@hdfcbank.com") while keeping VPAs at sentence end.
  private RX_VPA = /\b[a-z0-9][a-z0-9._-]+@[a-z]{2,}\b(?!\.[a-z])/
  private RX_LAST4 = /(?:\*{2,}|x{2,})\s?(\d{3,6})\b|\b(\d{4})\b/gi // internal only

  private VERBS_DEBIT = /\b(debited|paid|spent|withdrawn|purchased?|sent|transferred|charged)\b/i
  private VERBS_CREDIT = /\b(credited|received|deposited|reversed|refund(?:ed)?)\b/i

  private RX_MERCH_CUE = /\b(?:at|to|from)\s+/gi
  private RX_MASKED_ACCOUNT = /^x+\d/i
  // Tokens that end a merchant name: what follows a name in bank SMS, never part of one.
  private MERCHANT_STOP = new Set([
    'on',
    'via',
    'ref',
    'refno',
    'txn',
    'upi',
    'vpa',
    'avl',
    'bal',
    'balance',
    'available',
    'ledger',
    'ac',
    'acct',
    'account',
    'card',
    'info',
    'not',
    'is',
    'was',
    'has',
    'your',
    'please',
    'sms',
    'call',
    'dial',
    'block',
    'and',
    'or',
    'the',
    'of',
    'by',
    'from',
    'to',
    'at',
    'for',
    'rs',
    'inr',
    'dated',
    'dt',
    'id',
    'no',
    'mobile',
    'number',
    'customer',
    'helpline',
    'linked',
    'using',
    'dispute',
    'clearing',
  ])
  // A cue preceded by call-to-action context ("Call 1800... to report") is boilerplate, not a payee.
  private RX_CTA_CONTEXT = /call|sms|dial|click|visit|quer|dispute/i
  // Channel words that are valid inside a name ("HDFC ATM MG ROAD") but meaningless alone.
  private MERCHANT_NOISE = new Set(['atm', 'upi', 'imps', 'neft', 'rtgs', 'pos', 'netbanking', 'card'])

  private toNumber = (s: string) => {
    const v = Number(s.replace(/,/g, ''))
    return Number.isFinite(v) ? v : NaN
  }
  private pickCurrency = (s: string) => (/₹|inr|rs\b/i.test(s) ? 'INR' : 'INR')
  private windowHas = (hay: string, idx: number, rx: RegExp) =>
    rx.test(hay.slice(Math.max(0, idx - 30), Math.min(hay.length, idx + 30))) ? 1 : 0

  /**
   * Read a merchant-name run starting at `start`: word tokens up to a stop token,
   * a slash/masked-account token, a digit-leading token (dates, refs), or trailing
   * punctuation. Leading punctuation on the first token is skipped ("+MALL", "..STORE").
   * Returns the verbatim slice so callers can locate it in the body.
   */
  private captureNameAt(raw: string, start: number): string | undefined {
    const rx = /\S+/g
    rx.lastIndex = start
    let nameStart = -1
    let end = -1
    for (let count = 0; count < 5; count += 1) {
      const match = rx.exec(raw)
      if (!match) break
      const token = match[0]
      let word = token.replace(/[.,;:!?)'"]+$/, '')
      let offset = 0
      if (count === 0) {
        offset = (word.match(/^[^A-Za-z0-9]+/)?.[0] ?? '').length
        word = word.slice(offset)
      }
      const tildeAt = word.indexOf('~') // tilde-delimited formats fuse the next field onto the name
      if (tildeAt !== -1) word = word.slice(0, tildeAt)
      if (!word || !/^[A-Za-z]/.test(word) || word.includes('/')) break
      if (this.RX_MASKED_ACCOUNT.test(word) || this.MERCHANT_STOP.has(word.toLowerCase())) break
      if (nameStart === -1) nameStart = match.index + offset
      end = match.index + offset + word.length
      if (offset + word.length !== token.length) break // token was cut short: the name ends here
    }
    if (end === -1) return undefined
    const name = raw.slice(nameStart, end).trim()
    return name.length >= 2 ? name : undefined
  }

  /**
   * Merchant = the name after the at/to/from cue closest to the transaction amount,
   * skipping bank self-references and call-to-action tails; falls back to a UPI VPA
   * anywhere in the body.
   */
  private findMerchant(raw: string, amountIdx: number): string | undefined {
    const candidates: { name: string; index: number }[] = []
    for (const cue of raw.matchAll(this.RX_MERCH_CUE)) {
      const cueStart = cue.index ?? 0
      if (this.RX_CTA_CONTEXT.test(raw.slice(Math.max(0, cueStart - 25), cueStart))) continue
      const start = cueStart + cue[0].length
      const name = this.captureNameAt(raw, start)
      if (!name) continue
      const lower = name.toLowerCase()
      if (lower.includes('bank') || this.BANK_WORDS.includes(lower) || this.MERCHANT_NOISE.has(lower)) continue
      candidates.push({ name, index: start })
    }
    if (candidates.length > 0) {
      candidates.sort((a, b) => Math.abs(a.index - amountIdx) - Math.abs(b.index - amountIdx))
      return candidates[0].name
    }
    return raw.match(this.RX_VPA)?.[0] ?? undefined
  }

  extract(rawText: string, intent: Intent): TxnFields {
    const raw = String(rawText ?? '')
    const lower = raw.toLowerCase()

    // non-transactional intents
    if (intent === 'not_txn') {
      return {
        isTransaction: false,
        intent,
        confidence: 0.99,
        raw: { amounts: [], balances: [], refs: [] },
      }
    }
    // if (intent === 'future_payments') {
    //   const dueAmt = this.findAmounts(raw)[0]
    //   const dt = raw.match(this.RX_DATETIME)?.[0]
    //   return {
    //     isTransaction: false,
    //     intent,
    //     confidence: 0.9,
    //     amount: dueAmt && { value: dueAmt.value, currency: dueAmt.currency, confidence: 0.6 },
    //     datetimeText: dt || undefined,
    //     raw: { amounts: dueAmt ? [dueAmt] : [], balances: [], refs: [], channelHints: [] },
    //   }
    // }

    // txn intents
    const amounts = this.findAmounts(raw)
    const balances = this.findBalances(raw)
    const refs = Array.from(raw.matchAll(this.RX_UTR_RRN), (m) => m[0]).filter((x) => x.length >= 12)
    const bank = this.BANK_WORDS.find((b) => lower.includes(b))
    const datetime = raw.match(this.RX_DATETIME)?.[0] || undefined

    // pick transaction amount (verb proximity beats balance cues)
    let bestAmt = amounts[0]
    let bestScore = -1
    for (const a of amounts) {
      const verbScore = this.windowHas(raw, a.start, intent === 'income' ? this.VERBS_CREDIT : this.VERBS_DEBIT)
      const balPenalty = this.windowHas(raw, a.start, this.RX_BALANCE_CUE)
      const nearDir = this.windowHas(raw, a.start, /\b(to|from|at)\b/i)
      const s = 2 * verbScore + 0.5 * nearDir - 1.5 * balPenalty
      if (s > bestScore) {
        bestScore = s
        bestAmt = a
      }
    }

    const merchant = this.findMerchant(raw, bestAmt?.start ?? 0)

    const amountField = bestAmt && {
      value: bestAmt.value,
      currency: bestAmt.currency,
      confidence: 0.85 - (bestScore < 0 ? 0.2 : 0),
    }
    // const balanceField = balances[0] && { value: balances[0].value, currency: balances[0].currency, confidence: 0.8 }

    // overall confidence
    let conf = amountField ? 0.9 : 0.7
    if (intent === 'income' && this.VERBS_DEBIT.test(raw)) conf -= 0.2
    if (intent === 'expense' && this.VERBS_CREDIT.test(raw)) conf -= 0.2
    conf = Math.max(0.4, Math.min(0.99, conf))

    return {
      isTransaction: true,
      intent,
      amount: amountField,
      bank: bank ? { name: bank.toUpperCase(), confidence: 0.7 } : undefined,
      merchant: merchant || undefined,
      datetimeText: datetime,
      confidence: conf,
      raw: {
        amounts,
        balances,
        refs,
      },
    }
  }

  // helpers
  private findAmounts(raw: string) {
    const out: { text: string; value: number; currency: string; start: number; end: number }[] = []
    for (const m of raw.matchAll(this.RX_AMOUNT)) {
      const text = m[0]
      // Handle capture group for verb-based amounts (e.g., "debited by 60.0")
      const num = m[1] || text.match(this.RX_ANYNUM)?.[0] || ''
      const value = this.toNumber(num)
      if (!Number.isFinite(value)) continue
      out.push({
        text,
        value,
        currency: this.pickCurrency(text),
        start: m.index ?? 0,
        end: (m.index ?? 0) + text.length,
      })
    }
    return this.dedupeAmounts(out)
  }
  private findBalances(raw: string) {
    const out: { text: string; value: number; currency: string; start: number; end: number }[] = []
    if (this.RX_BALANCE_CUE.test(raw)) {
      for (const m of raw.matchAll(this.RX_AMOUNT)) {
        const idx = m.index ?? 0
        const cueBefore = this.RX_BALANCE_CUE.exec(raw.slice(Math.max(0, idx - 25), idx + 5))
        if (!cueBefore) continue
        const text = m[0]
        // Handle capture group for verb-based amounts
        const num = m[1] || text.match(this.RX_ANYNUM)?.[0] || ''
        const value = this.toNumber(num)
        if (!Number.isFinite(value)) continue
        out.push({ text, value, currency: this.pickCurrency(text), start: idx, end: idx + text.length })
      }
    }
    return this.dedupeAmounts(out)
  }
  private dedupeAmounts(list: { text: string; value: number; currency: string; start: number; end: number }[]) {
    const seen = new Set<string>()
    const out: typeof list = []
    for (const a of list) {
      const k = `${a.value}-${a.currency}`
      if (!seen.has(k)) {
        seen.add(k)
        out.push(a)
      }
    }
    return out
  }
}

export const SMSDataExtractor = SMSDataExtractorService.getInstance()
