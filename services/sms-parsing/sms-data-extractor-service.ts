// Brain-2: Transaction Fields (rule-based)

import type { Channel, Intent } from '@/types/sms/transaction'

export interface TxnFields {
  isTransaction: boolean
  intent: Intent
  amount?: { value: number; currency: string; confidence: number }
  bank?: { name: string; confidence: number }
  channel?: { type: Channel; confidence: number }
  merchant?: string // best-effort
  datetimeText?: string
  confidence: number

  // debug surface (optional; remove in prod)
  raw: {
    amounts: { text: string; value: number; start: number; end: number }[]
    balances: { text: string; value: number; start: number; end: number }[]
    refs: string[]
    channelHints: string[]
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
  private CHANNELS: { rx: RegExp; type: Channel }[] = [
    { rx: /\bupi\b/i, type: 'upi' },
    { rx: /\bimps\b/i, type: 'imps' },
    { rx: /\bneft\b/i, type: 'neft' },
    { rx: /\brtgs\b/i, type: 'rtgs' },
    { rx: /\bpos\b/i, type: 'pos' },
    { rx: /\batm\b/i, type: 'atm' },
    { rx: /\bnet\s?banking|internet\s?banking|ib\b/i, type: 'netbanking' },
  ]

  // core regex
  private RX_AMOUNT =
    /(?:(?:inr|rs\.?|₹)\s*)\d{1,3}(?:,\d{2,3})*(?:\.\d+)?|\b\d+(?:\.\d+)?\s*(?:inr|rs)\b|(?:debited|credited|paid|received|transferred|spent|withdrawn|deposited)\s+(?:by|of|for|to|from)?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d+)?)/gi
  private RX_ANYNUM = /\d{1,3}(?:,\d{2,3})*(?:\.\d+)?/
  private RX_BALANCE_CUE = /\b(avl\.?\s*bal|available\s*balance|ledger\s*balance|bal\.?)\b/i
  private RX_UTR_RRN = /\b[0-9A-Z]{10,22}\b/g
  private RX_DATETIME =
    /\b(?:\d{1,2}[:.]\d{2}\s?(?:am|pm)?)|(?:\d{1,2}[\/\-][A-Za-z]{3,9}[\/\-]?\d{0,4})|(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(?:\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b\.?\s?\d{1,2}(?:,\s?\d{2,4})?)/gi
  private RX_VPA = /\b[a-z0-9._-]{2,}@[a-z]{2,}\b/i // internal only
  private RX_LAST4 = /(?:\*{2,}|x{2,})\s?(\d{3,6})\b|\b(\d{4})\b/gi // internal only

  private VERBS_DEBIT = /\b(debited|paid|spent|withdrawn|purchased?|sent|transferred|charged)\b/i
  private VERBS_CREDIT = /\b(credited|received|reversed|refund(?:ed)?)\b/i

  private toNumber = (s: string) => {
    const v = Number(s.replace(/,/g, ''))
    return Number.isFinite(v) ? v : NaN
  }
  private pickCurrency = (s: string) => (/₹|inr|rs\b/i.test(s) ? 'INR' : 'INR')
  private windowHas = (hay: string, idx: number, rx: RegExp) =>
    rx.test(hay.slice(Math.max(0, idx - 30), Math.min(hay.length, idx + 30))) ? 1 : 0
  private neighborName = (text: string) => text.match(/\b(?:at|to|from)\s+([A-Z][A-Za-z0-9 &._-]{2,})/)?.[1]?.trim()

  extract(rawText: string, intent: Intent): TxnFields {
    const raw = String(rawText ?? '')
    const lower = raw.toLowerCase()

    // non-transactional intents
    if (intent === 'not_txn') {
      return {
        isTransaction: false,
        intent,
        confidence: 0.99,
        raw: { amounts: [], balances: [], refs: [], channelHints: [] },
      }
    }
    if (intent === 'future_payments') {
      const dueAmt = this.findAmounts(raw)[0]
      const dt = raw.match(this.RX_DATETIME)?.[0]
      return {
        isTransaction: false,
        intent,
        confidence: 0.9,
        amount: dueAmt && { value: dueAmt.value, currency: dueAmt.currency, confidence: 0.6 },
        datetimeText: dt || undefined,
        raw: { amounts: dueAmt ? [dueAmt] : [], balances: [], refs: [], channelHints: [] },
      }
    }

    // txn intents
    const amounts = this.findAmounts(raw)
    const balances = this.findBalances(raw)
    const refs = Array.from(raw.matchAll(this.RX_UTR_RRN), (m) => m[0]).filter((x) => x.length >= 12)
    const bank = this.BANK_WORDS.find((b) => lower.includes(b))
    const channelHit = this.CHANNELS.find((h) => h.rx.test(raw))
    const datetime = raw.match(this.RX_DATETIME)?.[0] || undefined
    const merchant = this.neighborName(raw)

    // internal signals (not returned): VPA/last4 can boost channel inference
    const hasVPA = this.RX_VPA.test(raw)
    const hasLast4 = !!raw.match(this.RX_LAST4)

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

    const amountField = bestAmt && {
      value: bestAmt.value,
      currency: bestAmt.currency,
      confidence: 0.85 - (bestScore < 0 ? 0.2 : 0),
    }
    // const balanceField = balances[0] && { value: balances[0].value, currency: balances[0].currency, confidence: 0.8 }

    // channel confidence: boost if we saw VPA (UPI) or card/account last4 for POS/ATM hints
    let channelType: Channel = channelHit?.type ?? (hasVPA ? 'upi' : 'unknown')
    let channelConf = channelHit ? 0.8 : hasVPA ? 0.7 : hasLast4 ? 0.6 : 0.4

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
      channel: { type: channelType, confidence: channelConf },
      merchant: merchant || undefined,
      datetimeText: datetime,
      confidence: conf,
      raw: {
        amounts,
        balances,
        refs,
        channelHints: this.CHANNELS.filter((h) => h.rx.test(raw)).map((h) => h.type),
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
