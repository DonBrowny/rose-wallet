import { Text } from '@/components/ui/text/text'
import React, { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'
import { useStyles } from './home-header.style'

export function HomeHeader() {
  const styles = useStyles()
  const waveAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.sequence([
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }, 500)

    return () => clearTimeout(timer)
  }, [waveAnimation])

  const waveRotation = waveAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '20deg'],
  })

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.greetingRow}>
          <Text variant='h5'>Hey,</Text>
          <Animated.Text style={[styles.waveEmoji, { transform: [{ rotate: waveRotation }] }]}>👋</Animated.Text>
        </View>
        <Text variant='pMd'>Welcome back!</Text>
      </View>
    </View>
  )
}
