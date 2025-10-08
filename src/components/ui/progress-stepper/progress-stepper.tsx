import React, { useMemo } from 'react'
import { View, ViewStyle } from 'react-native'
import Svg, { Rect } from 'react-native-svg'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './progress-stepper-styles'

interface ProgressStepperProps {
  total: number
  currentIndex: number
  gap?: number
  height?: number
  style?: ViewStyle | ViewStyle[]
}

export function ProgressStepper({ total, currentIndex, gap = 16, height = 8, style }: ProgressStepperProps) {
  const { theme } = useUnistyles()

  const clampedTotal = Math.max(0, total)
  const clampedIndex = Math.min(Math.max(0, currentIndex), Math.max(0, clampedTotal - 1))

  const segments = useMemo(() => Array.from({ length: clampedTotal }).map((_, i) => i), [clampedTotal])

  if (clampedTotal <= 1) return null

  // Use a virtual viewBox so we can place fixed-width segments with consistent gaps
  const viewBoxWidth = clampedTotal * 100 + (clampedTotal - 1) * gap
  const segmentWidth = 100

  return (
    <View style={[styles.linearContainer, style]}>
      <Svg
        width='100%'
        height={height}
        viewBox={`0 0 ${viewBoxWidth} ${height}`}
      >
        {segments.map((i) => {
          const x = i * (segmentWidth + gap)
          const isFilled = i <= clampedIndex
          const fill = isFilled ? theme.colors.primary : theme.colors.accentBlue
          return (
            <Rect
              key={i}
              x={x}
              y={0}
              width={segmentWidth}
              height={height}
              rx={height / 2}
              fill={fill}
            />
          )
        })}
      </Svg>
    </View>
  )
}
