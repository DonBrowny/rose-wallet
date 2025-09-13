import { Text } from '@/components/ui/text'
import { useTheme } from '@rneui/themed'
import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'
import { useStyles } from './gauge-chart.style'

const AnimatedPath = Animated.createAnimatedComponent(Path)

interface GaugeChartProps {
  minValue: number
  maxValue: number
  currentValue: number
}

export function GaugeChart({ minValue, maxValue, currentValue }: GaugeChartProps) {
  const styles = useStyles()
  const { theme } = useTheme()

  const actualPercentage = Math.max(((currentValue - minValue) / (maxValue - minValue)) * 100, 0)
  const targetPercentage = Math.min(actualPercentage, 100)

  const animatedPercentage = useSharedValue(0)

  useEffect(() => {
    animatedPercentage.value = withTiming(targetPercentage, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    })
  }, [targetPercentage, animatedPercentage])

  const getProgressColor = () => {
    if (targetPercentage >= 90) return theme.colors.error
    if (targetPercentage >= 70) return theme.colors.accentPurple
    return theme.colors.success
  }

  const animatedArcLength = useDerivedValue(() => {
    return 50 * Math.PI * (animatedPercentage.value / 100)
  })

  const animatedProps = useAnimatedProps(() => {
    'worklet'
    return {
      strokeDasharray: `${animatedArcLength.value} ${50 * Math.PI}`,
    }
  })

  return (
    <View style={styles.gauge}>
      <Svg
        width={120}
        height={80}
        style={styles.svg}
      >
        <Path
          d={`M 10 60 A 50 50 0 0 1 110 60`}
          stroke={theme.colors.grey1}
          strokeWidth={8}
          fill='transparent'
          strokeLinecap='round'
        />

        <AnimatedPath
          d={`M 10 60 A 50 50 0 0 1 110 60`}
          stroke={getProgressColor()}
          strokeWidth={8}
          fill='transparent'
          strokeLinecap='round'
          animatedProps={animatedProps}
        />
      </Svg>

      <View style={styles.valueDisplay}>
        <Text variant='h5'>
          {actualPercentage > 100 ? '>' : ''}
          {Math.round(targetPercentage)}%
        </Text>
      </View>
    </View>
  )
}
