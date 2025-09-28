export const MMKV_KEYS = {
  // Budget related keys
  BUDGET: {
    MONTHLY_BUDGET: 'budget.monthly_budget',
  },
} as const

// Type for all MMKV keys
export type MMKVKey = (typeof MMKV_KEYS)[keyof typeof MMKV_KEYS][keyof (typeof MMKV_KEYS)[keyof typeof MMKV_KEYS]]
