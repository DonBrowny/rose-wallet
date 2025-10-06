import { TabBarButton } from '@/components/tab-bar-button/tab-bar-button'
import { useTabBarVisibility } from '@/hooks/use-tab-bar-visibility'
import { type BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import { Tabs } from 'expo-router'
import { BarChart3, Home, Settings } from 'lucide-react-native'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Animated } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

export default function TabsLayout() {
  const { shouldHideTabBar } = useTabBarVisibility()
  const fadeAnim = useRef(new Animated.Value(1)).current
  const translateY = useRef(new Animated.Value(0)).current
  const { theme } = useUnistyles()

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
        backgroundColor: theme.colors.surface,
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
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.grey3,
      tabBarItemStyle: {
        marginVertical: 4,
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
      },
      tabBarButton: (props: any) => <TabBarButton {...props} />,
      tabBarShowLabel: false,
      animation: 'shift',
      tabBarHideOnKeyboard: true,
      tabBarBackground: () => null,
      tabBarInactiveBackgroundColor: 'transparent',
      tabBarActiveBackgroundColor: 'transparent',
      headerShown: false,
    }),
    [fadeAnim, theme.colors.grey3, theme.colors.primary, theme.colors.surface, translateY]
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
