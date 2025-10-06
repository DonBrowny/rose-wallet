import React from 'react'
import { Text as RNText, StyleProp, TextProps, TextStyle } from 'react-native'
import type { UnistylesThemes } from 'react-native-unistyles'
import { useUnistyles } from 'react-native-unistyles'

type Variant =
  | 'h0'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'pLg'
  | 'pLgBold'
  | 'pMd'
  | 'pMdBold'
  | 'pSm'
  | 'pSmBold'
  | 'aMd'
  | 'aMdBold'
  | 'aLg'
  | 'aLgBold'

type ThemeColorKey = keyof UnistylesThemes[keyof UnistylesThemes]['colors']

interface Props extends TextProps {
  variant?: Variant
  color?: keyof typeof colorKeys | ThemeColorKey | string
  style?: StyleProp<TextStyle>
}

const colorKeys = {
  default: 'onSurface',
  muted: 'textMuted',
} as const

export function Text({ variant = 'pMd', color = 'default', style, children, ...rest }: Props) {
  const { theme } = useUnistyles()

  const t = theme.typography
  const c = theme.colors

  const amountMdSize = (t as any)?.size?.amountMd ?? 16
  const amountLgSize = (t as any)?.size?.amountLg ?? 24
  const amountMdLine = (t as any)?.line?.amountMd ?? 20
  const amountLgLine = (t as any)?.line?.amountLg ?? 28

  const map: Record<Variant, TextStyle> = {
    // Headings
    h0: {
      fontFamily: t.family.bold,
      fontWeight: '700',
      fontSize: t.size.h0,
      lineHeight: t.line.h0,
      letterSpacing: t.track.tight,
    },
    h1: {
      fontFamily: t.family.extrabold,
      fontWeight: '800',
      fontSize: t.size.h1,
      lineHeight: t.line.h1,
      letterSpacing: t.track.tight,
    },
    h2: {
      fontFamily: t.family.extrabold,
      fontWeight: '800',
      fontSize: t.size.h2,
      lineHeight: t.line.h2,
      letterSpacing: t.track.tight,
    },
    h3: {
      fontFamily: t.family.extrabold,
      fontWeight: '800',
      fontSize: t.size.h3,
      lineHeight: t.line.h3,
      letterSpacing: t.track.tight,
    },
    h4: {
      fontFamily: t.family.semibold,
      fontWeight: '600',
      fontSize: t.size.h4,
      lineHeight: t.line.h4,
      letterSpacing: t.track.semiTight,
    },
    h5: {
      fontFamily: t.family.semibold,
      fontWeight: '600',
      fontSize: t.size.h5,
      lineHeight: t.line.h5,
      letterSpacing: t.track.semiTight,
    },

    // Paragraphs
    pLg: {
      fontFamily: t.family.regular,
      fontWeight: '400',
      fontSize: t.size.pLg,
      lineHeight: t.line.pLg,
      letterSpacing: t.track.semiTight,
    },
    pLgBold: {
      fontFamily: t.family.bold,
      fontWeight: '700',
      fontSize: t.size.pLg,
      lineHeight: t.line.pLg,
      letterSpacing: t.track.semiTight,
    },

    pMd: {
      fontFamily: t.family.regular,
      fontWeight: '400',
      fontSize: t.size.pMd,
      lineHeight: t.line.pMd,
      letterSpacing: t.track.normal,
    },
    pMdBold: {
      fontFamily: t.family.bold,
      fontWeight: '700',
      fontSize: t.size.pMd,
      lineHeight: t.line.pMd,
      letterSpacing: t.track.normal,
    },

    pSm: {
      fontFamily: t.family.regular,
      fontWeight: '400',
      fontSize: t.size.pSm,
      lineHeight: t.line.pSm,
      letterSpacing: t.track.normal,
    },
    pSmBold: {
      fontFamily: t.family.bold,
      fontWeight: '700',
      fontSize: t.size.pSm,
      lineHeight: t.line.pSm,
      letterSpacing: t.track.normal,
    },

    // Amounts (mono digits for perfect alignment on Android)
    aMd: {
      fontFamily: t.family.mono,
      fontWeight: '500',
      fontSize: amountMdSize,
      lineHeight: amountMdLine,
      letterSpacing: t.track.normal,
    },
    aMdBold: {
      fontFamily: t.family.mono,
      fontWeight: '700',
      fontSize: amountMdSize,
      lineHeight: amountMdLine,
      letterSpacing: t.track.normal,
    },
    aLg: {
      fontFamily: t.family.mono,
      fontWeight: '500',
      fontSize: amountLgSize,
      lineHeight: amountLgLine,
      letterSpacing: t.track.normal,
    },
    aLgBold: {
      fontFamily: t.family.mono,
      fontWeight: '700',
      fontSize: amountLgSize,
      lineHeight: amountLgLine,
      letterSpacing: t.track.normal,
    },
  }

  const raw = String(color)
  const mapped = (colorKeys as any)[raw] ?? raw
  const themeKey = (mapped in c ? mapped : 'black') as keyof typeof c
  const colorStyle: TextStyle = { color: c[themeKey] as string }

  return (
    <RNText
      {...rest}
      style={[map[variant], colorStyle, style]}
    >
      {children}
    </RNText>
  )
}
