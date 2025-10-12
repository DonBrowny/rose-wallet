import { useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import React, { useRef } from 'react'
import { Animated, Pressable } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './header-back-button.styles'

interface HeaderBackButtonProps {
  onPress?: () => void
  size?: number
  color?: string
}

export function HeaderBackButton({ onPress, size = 24, color }: HeaderBackButtonProps) {
  const { theme } = useUnistyles()
  const router = useRouter()

  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      try {
        router.back()
      } catch {
        // If back fails, redirect to home
        router.replace('/')
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
      testID='header-back-button'
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
          testID='header-back-icon'
          size={size}
          color={color || theme.colors.grey4}
        />
      </Animated.View>
    </Pressable>
  )
}
