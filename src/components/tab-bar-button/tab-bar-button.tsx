import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs'
import React, { forwardRef, useEffect, useMemo, useRef } from 'react'
import { Animated, Pressable } from 'react-native'
import { useStyles } from './tab-bar-button.styles'

export const TabBarButton = forwardRef<any, BottomTabBarButtonProps>((props, ref) => {
  const { children, style, ...restProps } = props
  const { accessibilityState } = props
  const styles = useStyles()
  const scaleAnim = useRef(new Animated.Value(1)).current
  const activeScaleAnim = useRef(new Animated.Value(1)).current
  const isFocused = accessibilityState?.selected

  useEffect(() => {
    Animated.spring(activeScaleAnim, {
      toValue: isFocused ? 1.1 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start()
  }, [isFocused, activeScaleAnim])

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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

  const rippleConfig = useMemo(
    () => ({
      color: 'rgba(111, 108, 217, 0.2)',
      borderless: false,
      radius: 26,
    }),
    []
  )

  return (
    <Pressable
      {...restProps}
      ref={ref}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, styles.button]}
      android_ripple={rippleConfig}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: scaleAnim }, { scale: activeScaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  )
})

TabBarButton.displayName = 'TabBarButton'
