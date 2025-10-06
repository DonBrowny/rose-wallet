import type { Transaction } from '@/types/sms/transaction'
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
  }
  setPatternReview: (transactions: Transaction[]) => void
}

const useAppStoreBase = create<AppState>()((set) => ({
  patternReview: {
    transactions: [],
  },
  setPatternReview: (transactions: Transaction[]) => set({ patternReview: { transactions } }),
}))

export const useAppStore = createSelectors(useAppStoreBase)
