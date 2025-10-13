import { updatePatternTemplateByName } from '@/services/database/patterns-repository'
import type { Transaction } from '@/types/sms/transaction'
import { setPatternSamplesByName } from '@/utils/mmkv/pattern-samples'
import { buildExtractionFromUser } from '@/utils/pattern/extraction-template-builder'
import { create, type StoreApi, type UseBoundStore } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type WithSelectors<S> = S extends { getState: () => infer T } ? S & { use: { [K in keyof T]: () => T[K] } } : never

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(_store: S) => {
  const store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (const k of Object.keys(store.getState())) {
    ;(store.use as any)[k] = () => store((s) => s[k as keyof typeof s])
  }

  return store
}

interface AppState {
  patternReview: {
    transactions: Transaction[]
    name: string
    currentIndex: number
  }
  setPatternReview: (transactions: Transaction[], name: string) => void
  isSaving: boolean
  error?: string
}

const useAppStoreBase = create<AppState>()(
  immer((set) => ({
    patternReview: {
      transactions: [],
      name: '',
      currentIndex: 0,
    },
    setPatternReview: (transactions: Transaction[], name: string) =>
      set((state) => {
        state.patternReview.transactions = transactions
        state.patternReview.name = name
        state.patternReview.currentIndex = 0
      }),
    isSaving: false,
    error: undefined,
  }))
)

export const reviewNext = () =>
  useAppStoreBase.setState((state) => ({
    patternReview: {
      ...state.patternReview,
      currentIndex: state.patternReview.currentIndex + 1,
    },
  }))
export const reviewPrev = () =>
  useAppStoreBase.setState((state) => ({
    patternReview: { ...state.patternReview, currentIndex: Math.max(0, state.patternReview.currentIndex - 1) },
  }))

export const reviewReset = () =>
  useAppStoreBase.setState((state) => ({ patternReview: { ...state.patternReview, currentIndex: 0 } }))

export const reviewUpdateItem = (index: number, patch: Partial<Transaction>) =>
  useAppStoreBase.setState((state) => {
    const { transactions } = state.patternReview
    const next = transactions.map((t, i) => (i === index ? { ...t, ...patch } : t))
    return { patternReview: { ...state.patternReview, transactions: next } }
  })

export const finalizeReview = async (): Promise<void> => {
  useAppStoreBase.setState({ isSaving: true, error: undefined })
  try {
    const { patternReview } = useAppStoreBase.getState()
    const { transactions, name } = patternReview
    setPatternSamplesByName(name, transactions)
    const { template } = buildExtractionFromUser(transactions)
    await updatePatternTemplateByName(name, template)
    useAppStoreBase.setState({ isSaving: false })
  } catch (err: any) {
    console.warn('finalizeReview failed', err)
    useAppStoreBase.setState({ isSaving: false, error: String(err?.message || err) })
  }
}

export const useAppStore = createSelectors(useAppStoreBase)
