export const MMKV_KEYS = {
  BUDGET: {
    MONTHLY_BUDGET: 'budget.monthly_budget',
  },
  PATTERNS: {
    IS_PATTERN_DISCOVERY_COMPLETED: 'patterns.is_pattern_discovery_completed',
  },
} as const

// Type for all MMKV keys
export type MMKVKey = (typeof MMKV_KEYS)[keyof typeof MMKV_KEYS][keyof (typeof MMKV_KEYS)[keyof typeof MMKV_KEYS]]
