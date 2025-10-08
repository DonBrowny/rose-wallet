import { updatePatternTemplateByName } from '@/services/database/patterns-repository'
import type { Transaction } from '@/types/sms/transaction'
import { setPatternSamplesByName } from '@/utils/mmkv/pattern-samples'
import { buildExtractionFromUser } from '@/utils/pattern/extraction-template-builder'
import { create, type StoreApi, type UseBoundStore } from 'zustand'

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
}

const useAppStoreBase = create<AppState>()((set) => ({
  patternReview: {
    transactions: [],
    name: '',
    currentIndex: 0,
  },
  setPatternReview: (transactions: Transaction[], name: string) =>
    set((state) => ({ patternReview: { transactions, name, currentIndex: 0 } })),
}))

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

export const reviewUpdateItem = (index: number, patch: Partial<Transaction>, isLast: boolean = false) =>
  useAppStoreBase.setState((state) => {
    const { transactions, name } = state.patternReview
    const next = transactions.map((t, i) => (i === index ? { ...t, ...patch } : t))
    if (isLast) {
      setPatternSamplesByName(name, next)
      const { template } = buildExtractionFromUser(next)
      // best-effort async update; no await to avoid blocking state update
      updatePatternTemplateByName(name, template).catch((err) => console.warn('Failed to update template', err))
    }
    return { patternReview: { ...state.patternReview, transactions: next } }
  })

export const useAppStore = createSelectors(useAppStoreBase)
