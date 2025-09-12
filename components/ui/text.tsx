// components/ThemedText.tsx
import { useTheme } from '@rneui/themed'
import React from 'react'
import { Text as RNText, StyleProp, TextProps, TextStyle } from 'react-native'

type Variant = 'h0' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'pLg' | 'pLgBold' | 'pMd' | 'pMdBold' | 'pSm' | 'pSmBold'

type Props = TextProps & {
  variant?: Variant
  color?: keyof typeof colorKeys
  style?: StyleProp<TextStyle>
}

const colorKeys = {
  default: 'black',
  muted: 'textMuted',
  brand: 'primary',
  danger: 'error',
  success: 'success',
} as const

export function Text({ variant = 'pMd', color = 'default', style, children, ...rest }: Props) {
  const { theme } = useTheme()

  const t = theme.typography
  const c = theme.colors

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
  }

  const colorStyle: TextStyle = { color: c[colorKeys[color] as keyof typeof c] as string }

  return (
    <RNText
      {...rest}
      style={[map[variant], colorStyle, style]}
    >
      {children}
    </RNText>
  )
}
