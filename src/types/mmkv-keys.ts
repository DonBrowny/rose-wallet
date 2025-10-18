export const MMKV_KEYS = {
  APP: {
    ONBOARDING_COMPLETED: 'app.onboarding_completed',
  },
  BUDGET: {
    MONTHLY_BUDGET: 'budget.monthly_budget',
  },
  PATTERNS: {
    IS_PATTERN_DISCOVERY_COMPLETED: 'patterns.is_pattern_discovery_completed',
    DISCOVERY_SAMPLES_V1: 'patterns.discovery_samples_v1',
  },
} as const

// Type for all MMKV keys
export type MMKVKey = (typeof MMKV_KEYS)[keyof typeof MMKV_KEYS][keyof (typeof MMKV_KEYS)[keyof typeof MMKV_KEYS]]
