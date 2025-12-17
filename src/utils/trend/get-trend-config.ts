import type { LucideIcon } from 'lucide-react-native'
import { ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp } from 'lucide-react-native'

export type TrendDirection = 'up' | 'down' | 'same'

export interface TrendConfig {
  TrendIcon: LucideIcon
  ArrowIcon: LucideIcon
  color: string
  background: string
}

export interface TrendColors {
  error: string
  success: string
  textMuted: string
  accentRed: string
  accentGreen: string
  grey0: string
}

export interface DiffColors {
  error: string
  success: string
  textMuted: string
}

export function getTrendDirection(percentageChange: number): TrendDirection {
  if (percentageChange > 0) return 'up'
  if (percentageChange < 0) return 'down'
  return 'same'
}

export function getTrendConfig(direction: TrendDirection, colors: TrendColors): TrendConfig {
  const configs: Record<TrendDirection, TrendConfig> = {
    up: {
      TrendIcon: TrendingUp,
      ArrowIcon: ArrowUp,
      color: colors.error,
      background: colors.accentRed,
    },
    down: {
      TrendIcon: TrendingDown,
      ArrowIcon: ArrowDown,
      color: colors.success,
      background: colors.accentGreen,
    },
    same: {
      TrendIcon: Minus,
      ArrowIcon: Minus,
      color: colors.textMuted,
      background: colors.grey0,
    },
  }
  return configs[direction]
}

export function getDiffColor(diff: number, colors: DiffColors): string {
  if (diff > 0) return colors.error
  if (diff < 0) return colors.success
  return colors.textMuted
}
