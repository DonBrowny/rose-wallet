import { TabBarButton } from '@/components/tab-bar-button/tab-bar-button'
import { useTabBarVisibility } from '@/hooks/use-tab-bar-visibility'
import { theme } from '@/theme/rne-theme'
import { type BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import { Tabs } from 'expo-router'
import { BarChart3, Home, Settings } from 'lucide-react-native'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Animated } from 'react-native'

export default function TabsLayout() {
  const { shouldHideTabBar } = useTabBarVisibility()
  const fadeAnim = useRef(new Animated.Value(1)).current
  const translateY = useRef(new Animated.Value(0)).current

  const animateTabBar = useCallback(
    (hide: boolean) => {
      const toValue = hide ? 0 : 1
      const translateValue = hide ? 100 : 0

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: translateValue,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    },
    [fadeAnim, translateY]
  )

  useEffect(() => {
    animateTabBar(shouldHideTabBar)
  }, [shouldHideTabBar, animateTabBar])

  const screenOptions: BottomTabNavigationOptions = useMemo(
    () => ({
      tabBarStyle: {
        position: 'absolute' as const,
        bottom: 24,
        height: 60,
        backgroundColor: theme.lightColors?.white,
        marginHorizontal: 60,
        borderRadius: 30,
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        borderTopWidth: 0,
        opacity: fadeAnim,
        transform: [{ translateY }],
      },
      tabBarActiveTintColor: theme.lightColors?.primary,
      tabBarInactiveTintColor: theme.lightColors?.grey3,
      tabBarItemStyle: {
        marginVertical: 4,
        height: 52,
        display: 'flex' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: 4,
      },
      tabBarButton: (props: any) => <TabBarButton {...props} />,
      tabBarShowLabel: false,
      animation: 'shift' as const,
      tabBarHideOnKeyboard: true,
      tabBarBackground: () => null,
      tabBarInactiveBackgroundColor: 'transparent',
      tabBarActiveBackgroundColor: 'transparent',
      headerShown: false,
    }),
    [fadeAnim, translateY]
  )

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name='index'
        options={{
          tabBarIcon: ({ color, size }) => (
            <Home
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='analytics'
        options={{
          tabBarIcon: ({ color, size }) => (
            <BarChart3
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          tabBarIcon: ({ color, size }) => (
            <Settings
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  )
}
