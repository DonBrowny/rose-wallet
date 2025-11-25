export const MMKV_KEYS = {
  APP: {
    ONBOARDING_COMPLETED: 'app.onboarding_completed',
    GETTING_STARTED_SEEN: 'app.getting_started_seen',
  },
  BUDGET: {
    MONTHLY_BUDGET: 'budget.monthly_budget',
  },
  SMS: {
    LAST_READ_AT: 'sms.last_read_at',
  },
  PATTERNS: {
    IS_PATTERN_DISCOVERY_COMPLETED: 'patterns.is_pattern_discovery_completed',
    DISCOVERY_SAMPLES_V1: 'patterns.discovery_samples_v1',
    FIRST_OPEN_GUIDE_SEEN: 'patterns.first_open_guide_seen',
    REVIEW_GUIDE_SEEN: 'patterns.review_guide_seen',
  },
} as const

// Type for all MMKV keys
export type MMKVKey = (typeof MMKV_KEYS)[keyof typeof MMKV_KEYS][keyof (typeof MMKV_KEYS)[keyof typeof MMKV_KEYS]]
