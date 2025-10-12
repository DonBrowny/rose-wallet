import { SMSIntentService, preRuleDecision } from './sms-intent-service'

jest.mock('@/utils/pattern/constant', () => ({
  RX_COMPLETED_EXPENSE: /completed expense/i,
  RX_COMPLETED_INCOME: /completed income/i,
  RX_FAILURE: /failed|failure/i,
  RX_FUTURE_TENSE: /\bwill\b|scheduled/i,
  TEMPLATES: {
    not_txn: ['hello'],
    expense: ['buy', 'paid'],
    income: ['salary', 'credited'],
  },
}))

jest.mock('react-native-executorch', () => {
  const mockLoad = jest.fn(async () => {})
  const mockForward = jest.fn(async (text: any) => {
    const t = String(text || '').toLowerCase()
    if (t.includes('buy') || t.includes('paid')) return new Float32Array([1, 0])
    if (t.includes('salary') || t.includes('credited')) return new Float32Array([0, 1])
    return new Float32Array([0, 0])
  })
  class TextEmbeddingsModule {
    load = mockLoad
    forward = mockForward
  }
  return { TextEmbeddingsModule, ALL_MINILM_L6_V2: 'dummy-model' }
})

function resetService() {
  const svc = SMSIntentService.getInstance() as any
  svc.ready = false
  svc.templates = { not_txn: [], expense: [], income: [] }
  return SMSIntentService.getInstance()
}

describe('SMSIntentService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('preRuleDecision (rules first)', () => {
    it('returns not_txn for empty or whitespace', async () => {
      expect(preRuleDecision('')).toEqual({ label: 'not_txn', prob: 1 })
      expect(preRuleDecision('   ')).toEqual({ label: 'not_txn', prob: 1 })
    })

    it('flags failures as not_txn', async () => {
      const res = preRuleDecision('Your transaction failed due to limits')
      expect(res?.label).toBe<'not_txn'>('not_txn')
    })

    it('prefers completed expense over future tense', async () => {
      const res = preRuleDecision('Completed expense of INR 500 at StoreX')
      expect(res?.label).toBe<'expense'>('expense')
    })

    it('identifies completed income', async () => {
      const res = preRuleDecision('Completed income: Salary credited INR 10,000')
      expect(res?.label).toBe<'income'>('income')
    })
  })

  describe('init and classify', () => {
    it('throws if classify called before init', async () => {
      const svc = resetService()
      await expect(svc.classify('paid 100 to store')).rejects.toThrow('init()')
    })

    it('loads model only once across multiple init calls', async () => {
      const svc = resetService()
      const loadSpy = jest.spyOn((svc as any).mod, 'load')
      await svc.init()
      await svc.init()
      expect(loadSpy).toHaveBeenCalledTimes(1)
    })

    it('classifies expense via embeddings when rules are inconclusive', async () => {
      const svc = resetService()
      await svc.init()
      const res = await svc.classify('I went to buy groceries today')
      expect(res.label).toBe<'expense'>('expense')
      expect(res.prob).toBeGreaterThan(0)
    })

    it('classifies income via embeddings when rules are inconclusive', async () => {
      const svc = resetService()
      await svc.init()
      const res = await svc.classify('Monthly salary credited.')
      expect(res.label).toBe<'income'>('income')
    })

    it('returns not_txn when similarity is below threshold', async () => {
      const svc = resetService()
      await svc.init()
      const res = await svc.classify('random unrelated text with no signal')
      expect(res.label).toBe<'not_txn'>('not_txn')
    })
  })
})
