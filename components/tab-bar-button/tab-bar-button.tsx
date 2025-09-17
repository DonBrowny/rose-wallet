import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs'
import React, { forwardRef, useRef } from 'react'
import { Animated, Pressable } from 'react-native'
import { useStyles } from './tab-bar-button.styles'

export const TabBarButton = forwardRef<any, BottomTabBarButtonProps>((props, ref) => {
  const { children, style, ...restProps } = props
  const styles = useStyles()
  const scaleAnim = useRef(new Animated.Value(1)).current

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

  return (
    <Pressable
      {...restProps}
      ref={ref}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={() => [
        style,
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 4,
          paddingHorizontal: 12,
          borderRadius: 30, // Match the tab bar border radius
          overflow: 'hidden', // This ensures ripple respects border radius
        },
      ]}
      android_ripple={{
        color: 'rgba(111, 108, 217, 0.2)', // Custom ripple color
        borderless: false, // Important: keeps ripple within bounds
        radius: 26, // Match border radius
      }}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  )
})

TabBarButton.displayName = 'TabBarButton'
