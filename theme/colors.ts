export const palette = {
  ink: {
    1: '#191D21',
    2: '#656F77',
    3: '#ACB8C2',
    4: '#CDD9E3',
    5: '#E8EEF3',
    6: '#F4F7FA',
    7: '#FFFFFF',
  },
  utility: {
    active: '#6F6CD9', // brand/CTA (violet)
    success: '#23E9B4',
    info: '#91D7E0',
    danger: '#FF5A5A',
  },
  accent: {
    blue: '#D3E1FF',
    green: '#D0F1EB',
    purple: '#DED2F9',
    orange: '#F5D4C1',
    red: '#FDC9D2',
    yellow: '#F9E8BD',
  },
} as const

export type ElevKey = 1 | 2 | 3 | 4 | 'nav'

export const elevation = {
  1: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  2: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  3: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  4: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 24 },
    elevation: 10,
  },
  nav: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -10 },
    elevation: 2,
  },
} as const

export type Palette = typeof palette
