import type { Intent } from '@/types/sms/transaction'
import {
  RX_COMPLETED_EXPENSE,
  RX_COMPLETED_INCOME,
  RX_FAILURE,
  RX_FUTURE_TENSE,
  // RX_REMINDER,
  // RX_SCHEDULED,
  TEMPLATES,
} from '@/utils/pattern/constant'
import { ALL_MINILM_L6_V2, TextEmbeddingsModule } from 'react-native-executorch'

export type ClassifyResult = { label: Intent; prob: number }

// ───────────────────────────────────────────────────────────────────────────────
// Normalization & math helpers
// ───────────────────────────────────────────────────────────────────────────────
const normalize = (s: string) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/₹/g, ' inr ')
    .replace(/\brs\.?/g, ' inr ')
    .replace(/\ba\/c\b/g, ' account ')
    .replace(/\bacc(?:ount)?\s*no\.?/g, ' account ')
    .replace(/\bavl\s*bal\b/g, ' available balance ')
    .replace(/\*+\d+\b|\bxx+\d+\b/g, '<last4>')
    .replace(/\d[\d,]*\.\d+|\d[\d,]*/g, '<num>')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const dot = (a: ArrayLike<number>, b: ArrayLike<number>) => {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}
const norm = (a: ArrayLike<number>) => Math.sqrt(dot(a, a))
const cos = (a: ArrayLike<number>, b: ArrayLike<number>) => dot(a, b) / (norm(a) * norm(b) + 1e-8)

/**
 * Returns a rule-based decision if confident, otherwise null to defer to embeddings.
 */
export function preRuleDecision(rawText: string): ClassifyResult | null {
  const raw = String(rawText ?? '').trim()
  if (!raw) return { label: 'not_txn', prob: 1 }

  // 0) Failures → not_txn
  if (RX_FAILURE.test(raw)) return { label: 'not_txn', prob: 0.9 }

  // 1) Completed beats future/reminder
  const completedExpense = RX_COMPLETED_EXPENSE.test(raw) && !RX_FUTURE_TENSE.test(raw)
  const completedIncome = RX_COMPLETED_INCOME.test(raw) && !RX_FUTURE_TENSE.test(raw)

  if (completedExpense) return { label: 'expense', prob: 0.9 }
  if (completedIncome) return { label: 'income', prob: 0.9 }

  // 2) Future/reminder (no completion verbs)
  // if (RX_SCHEDULED.test(raw) || RX_REMINDER.test(raw)) {
  //   return { label: 'future_payments', prob: 0.9 }
  // }

  // 3) No strong rule — let embeddings decide
  return null
}

export class SMSIntentService {
  // Singleton plumbing
  private static _instance: SMSIntentService | null = null
  static getInstance() {
    if (!this._instance) this._instance = new SMSIntentService()
    return this._instance
  }
  private constructor() {}

  // State
  private mod = new TextEmbeddingsModule()
  private ready = false
  private threshold = 0.3
  private templates: Record<Intent, Float32Array[]> = {
    not_txn: [],
    expense: [],
    income: [],
    // future_payments: [],
  }

  // serialize all native forward() calls
  private queue: Promise<any> = Promise.resolve()
  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = this.queue.then(task, task)
    this.queue = run.then(
      () => undefined,
      () => undefined
    )
    return run
  }
  private safeForward = (text: string) => this.enqueue(() => this.mod.forward(text))

  /**
   * Initialize once (loads model + precomputes template embeddings)
   * Optionally switch to a custom source if you side-load later.
   */
  async init() {
    if (this.ready) return
    await this.mod.load(ALL_MINILM_L6_V2)
    await this.safeForward('hello')

    for (const key of Object.keys(TEMPLATES) as Intent[]) {
      for (const t of TEMPLATES[key]) {
        const v = await this.safeForward(t)
        this.templates[key].push(v)
      }
    }
    this.ready = true
  }

  async classify(text: string): Promise<ClassifyResult> {
    if (!this.ready) throw new Error('SMSIntentService not initialized. Call init() first.')

    // 1) Try pre-rules first
    const pre = preRuleDecision(text)
    if (pre) return pre

    // 2) Embedding similarity fallback
    const v = await this.safeForward(normalize(text))
    let best: Intent = 'not_txn'
    let score = -1

    ;(Object.keys(this.templates) as Intent[]).forEach((label) => {
      const s = this.templates[label].reduce((m, tv) => Math.max(m, cos(v, tv)), -1)
      if (s > score) {
        score = s
        best = label
      }
    })

    if (score < this.threshold) return { label: 'not_txn', prob: 1 - Math.max(0, score) }
    return { label: best, prob: Math.min(0.99, Math.max(0.5, score)) }
  }
}

export const SMSIntent = SMSIntentService.getInstance()
