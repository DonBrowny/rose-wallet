import React, { useEffect, useMemo, useRef } from 'react'
import { Animated, Easing, View, ViewStyle } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

interface ProgressBarProps {
  total: number
  currentIndex: number
  height?: number
  style?: ViewStyle | ViewStyle[]
}

export function ProgressBar({ total, currentIndex, height = 8, style }: ProgressBarProps) {
  const { theme } = useUnistyles()
  const clampedTotal = Math.max(1, total)
  const clampedIndex = Math.min(Math.max(0, currentIndex), clampedTotal - 1)

  const target = useMemo(() => (clampedIndex + 1) / clampedTotal, [clampedIndex, clampedTotal])
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(progress, {
      toValue: target,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [target, progress])

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })

  return (
    <View
      style={{
        width: '100%',
        height,
        borderRadius: 999,
        backgroundColor: theme.colors.grey1,
        overflow: 'hidden',
        ...(Array.isArray(style) ? Object.assign({}, ...style) : (style as object | undefined)),
      }}
    >
      <Animated.View style={{ height: '100%', width, backgroundColor: theme.colors.primary, borderRadius: 999 }} />
    </View>
  )
}
