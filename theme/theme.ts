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
    warning: '#FFAC4B',
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

export const font = {
  regular: 'Manrope_400Regular',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
  mono: 'IBMPlexMono_500Medium',
  monoBold: 'IBMPlexMono_700Bold',
} as const

export const typography = {
  family: {
    regular: font.regular, // 400
    semibold: font.semiBold, // 600
    bold: font.bold, // 700
    extrabold: font.extraBold, // 800
    mono: font.mono, // 500
    monoBold: font.monoBold, // 700
  },
  // sizes
  size: {
    h0: 72,
    h1: 56,
    h2: 40,
    h3: 32,
    h4: 24,
    h5: 20,
    pLg: 18,
    pMd: 14,
    pSm: 12,
  },
  // line heights (px)
  line: {
    h0: Math.round(72 * 1.05), // 76
    h1: Math.round(56 * 1.12), // 63
    h2: Math.round(40 * 1.12), // 45
    h3: 42, // as specified
    h4: Math.round(24 * 1.3), // 28
    h5: 30, // as specified
    pLg: 24,
    pMd: 24,
    pSm: 16,
  },
  // letter spacing (px)
  track: {
    tight: -1,
    semiTight: -0.5,
    normal: 0,
  },
}

export type Palette = typeof palette
