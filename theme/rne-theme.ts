import { createTheme } from '@rneui/themed'
import { elevation, palette, typography } from './theme'

declare module '@rneui/themed' {
  export interface Colors {
    border: string
    input: string
    surfaceMuted: string
    textMuted: string
    accentBlue: string
    accentGreen: string
    accentPurple: string
    accentOrange: string
    accentRed: string
    accentYellow: string
  }

  export interface Theme {
    elevation: typeof elevation
    typography: typeof typography
  }
}

const Font = {
  regular: 'Manrope_400Regular',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
} as const

export const theme = createTheme({
  mode: 'light',
  lightColors: {
    primary: palette.utility.active,
    success: palette.utility.success,
    error: palette.utility.danger,
    warning: palette.accent.yellow,

    background: palette.ink[7],
    white: palette.ink[7],
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

  components: {
    Text: {
      style: {
        color: palette.ink[1],
        fontFamily: typography.family.regular,
        fontWeight: '400',
        fontSize: typography.size.pMd,
        lineHeight: typography.line.pMd,
        letterSpacing: typography.track.normal,
      },
    },

    Button: {
      buttonStyle: { borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16 },
      titleStyle: { fontFamily: Font.semibold, fontWeight: '600' },
    },

    /* Inputs */
    // Input: {
    //   inputStyle: { color: palette.ink[1], fontFamily: Font.regular, fontWeight: '400' },
    //   labelStyle: { color: palette.ink[2], fontFamily: Font.semibold, fontWeight: '600' },
    //   placeholderTextColor: palette.ink[2],
    //   inputContainerStyle: { borderBottomColor: palette.ink[5] },
    // },

    /* Cards */
    Card: {
      containerStyle: {
        backgroundColor: palette.ink[7],
        borderRadius: 24,
        borderWidth: 1,
        borderColor: palette.ink[5],
        padding: 16,
        ...elevation[2],
      },
    },

    /* Lists */
    ListItem: {
      containerStyle: { backgroundColor: palette.ink[7], borderBottomColor: palette.ink[5] },
    },
    ListItemTitle: { style: { color: palette.ink[1], fontFamily: Font.semibold, fontWeight: '600' } },
    ListItemSubtitle: { style: { color: palette.ink[2], fontFamily: Font.regular, fontWeight: '400' } },

    /* Tabs */
    Tab: {
      indicatorStyle: { backgroundColor: palette.utility.active },
      titleStyle: { color: palette.ink[2], fontFamily: Font.semibold, fontWeight: '600' },
    },
    TabItem: {
      titleStyle: (pressed) => ({
        color: pressed ? palette.utility.active : palette.ink[1],
        fontFamily: Font.semibold,
        fontWeight: '600',
      }),
    },

    /* Chips & Badges (defaults; override per use with accents) */
    Chip: {
      buttonStyle: { borderRadius: 14, backgroundColor: palette.ink[6] },
      titleStyle: { color: palette.ink[1], fontFamily: Font.semibold, fontWeight: '600' },
    },
    Badge: {
      badgeStyle: { backgroundColor: palette.accent.blue },
      textStyle: { color: palette.ink[1], fontFamily: Font.semibold, fontWeight: '600' },
    },

    /* FAB */
    FAB: {
      color: palette.ink[7],
      buttonStyle: { backgroundColor: palette.utility.active },
    },

    Input: {
      containerStyle: {
        paddingHorizontal: 0, // align with card edges
      },
      inputContainerStyle: {
        // "filled" field by default
        backgroundColor: palette.ink[6], // #F4F7FA (muted surface)
        borderRadius: 14,
        borderWidth: 1,
        borderColor: palette.ink[5], // #E8EEF3 (input/border)
        minHeight: 48,
        paddingHorizontal: 12,
      },
      inputStyle: {
        color: palette.ink[1], // #191D21
        fontFamily: Font.regular,
        fontWeight: '400',
        fontSize: 16,
      },
      selectionColor: palette.utility.active, // cursor/selection
      labelStyle: {
        color: palette.ink[2], // #656F77
        fontFamily: Font.semibold,
        fontWeight: '600',
        marginBottom: 6,
      },
      placeholderTextColor: palette.ink[2], // subtle placeholder
      leftIcon: { color: palette.ink[3] }, // default icon tint
      rightIcon: { color: palette.ink[3] },
      errorStyle: {
        color: palette.utility.danger, // #FF5A5A
        marginTop: 6,
        fontFamily: Font.regular,
        fontWeight: '400',
      },
    },
  },
})

export const tileBg = (t = theme) => ({
  blue: { backgroundColor: t.lightColors?.accentBlue },
  green: { backgroundColor: t.lightColors?.accentGreen },
  purple: { backgroundColor: t.lightColors?.accentPurple },
  orange: { backgroundColor: t.lightColors?.accentOrange },
  red: { backgroundColor: t.lightColors?.accentRed },
  yellow: { backgroundColor: t.lightColors?.accentYellow },
})
