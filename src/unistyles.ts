import { StyleSheet } from 'react-native-unistyles'
import { elevation, palette, typography } from './theme/theme'

const lightTheme = {
  colors: {
    primary: palette.utility.active,
    success: palette.utility.success,
    error: palette.utility.danger,
    warning: palette.utility.warning,

    background: palette.ink[7],
    neutral: palette.ink[7],
    black: palette.ink[1],
    grey0: palette.ink[6], // muted surface
    grey1: palette.ink[5], // borders/inputs
    grey2: palette.ink[4],
    grey3: palette.ink[3],
    grey4: palette.ink[2],
    grey5: palette.ink[1],

    border: palette.ink[5],
    input: palette.ink[5],
    surfaceMuted: palette.ink[6],
    textMuted: palette.ink[2],
    accentBlue: palette.accent.blue,
    accentGreen: palette.accent.green,
    accentPurple: palette.accent.purple,
    accentOrange: palette.accent.orange,
    accentRed: palette.accent.red,
    accentYellow: palette.accent.yellow,
  },
  elevation,
  typography,
  space: (v: number) => v * 4,
  gap: (v: number) => v * 8,
}

const otherTheme = {
  colors: {
    primary: palette.utility.active,
    success: palette.utility.success,
    error: palette.utility.danger,
    warning: palette.utility.warning,

    background: palette.ink[7],
    neutral: palette.ink[7],
    black: palette.ink[1],
    grey0: palette.ink[6], // muted surface
    grey1: palette.ink[5], // borders/inputs
    grey2: palette.ink[4],
    grey3: palette.ink[3],
    grey4: palette.ink[2],
    grey5: palette.ink[1],

    border: palette.ink[5],
    input: palette.ink[5],
    surfaceMuted: palette.ink[6],
    textMuted: palette.ink[2],
    accentBlue: palette.accent.blue,
    accentGreen: palette.accent.green,
    accentPurple: palette.accent.purple,
    accentOrange: palette.accent.orange,
    accentRed: palette.accent.red,
    accentYellow: palette.accent.yellow,
  },
  elevation,
  typography,
  space: (v: number) => v * 4,
  gap: (v: number) => v * 8,
}

const appThemes = {
  light: lightTheme,
  other: otherTheme,
}

type AppThemes = typeof appThemes

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  settings: {
    initialTheme: 'light',
  },
  themes: appThemes,
})
