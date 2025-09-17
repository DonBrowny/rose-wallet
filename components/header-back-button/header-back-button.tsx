import { useTheme } from '@rneui/themed'
import { useRouter, useSegments } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import React, { useRef } from 'react'
import { Animated, Pressable } from 'react-native'
import { useStyles } from './header-back-button.styles'

interface HeaderBackButtonProps {
  onPress?: () => void
  size?: number
  color?: string
}

export function HeaderBackButton({ onPress, size = 24, color }: HeaderBackButtonProps) {
  const { theme } = useTheme()
  const router = useRouter()
  const segments = useSegments()
  const styles = useStyles()
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      // Check if we can go back by looking at navigation history
      // If we're at the root level or only have one segment, go to home
      if (segments.length <= 1) {
        router.replace('/')
      } else {
        try {
          router.back()
        } catch {
          // If back fails, redirect to home
          router.replace('/')
        }
      }
    }
  }

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start()
  }

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ArrowLeft
          size={size}
          color={color || theme.colors.grey4}
        />
      </Animated.View>
    </Pressable>
  )
}
