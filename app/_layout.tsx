import { HeaderBackButton } from '@/components/header-back-button/header-back-button'
import { TabBarButton } from '@/components/tab-bar-button/tab-bar-button'
import { useTabBarVisibility } from '@/hooks/use-tab-bar-visibility'
import { theme } from '@/theme/rne-theme'
import { DB_NAME } from '@/types/constants'
import { ThemeProvider } from '@rneui/themed'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { Tabs } from 'expo-router'
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite'
import { BarChart3, Home, Plus, Settings } from 'lucide-react-native'
import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react'
import { ActivityIndicator, Animated, Text, View } from 'react-native'
import migrations from '../drizzle/migrations'

const expoDb = openDatabaseSync(DB_NAME)
const db = drizzle(expoDb)

export default function Root() {
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

  const screenOptions = useMemo(
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
      tabBarBackground: () => null, // Remove default background for custom styling
      tabBarInactiveBackgroundColor: 'transparent',
      tabBarActiveBackgroundColor: 'transparent',
    }),
    [fadeAnim, translateY]
  )

  const { success, error } = useMigrations(db, migrations)
  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    )
  }
  if (!success) {
    return (
      <View>
        <Text>Migration is in progress...</Text>
      </View>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <Suspense fallback={<ActivityIndicator size='large' />}>
        <SQLiteProvider
          databaseName={DB_NAME}
          options={{ enableChangeListener: true }}
          useSuspense
        >
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
                headerShown: false,
              }}
            />
            <Tabs.Screen
              name='patterns'
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Plus
                    size={size}
                    color={color}
                  />
                ),
                headerShown: true,
                headerTitle: 'Add Expenses',
                headerTitleAlign: 'center',
                headerLeft: () => <HeaderBackButton />,
                animation: 'fade',
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
                headerShown: false,
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
                headerShown: false,
              }}
            />
          </Tabs>
        </SQLiteProvider>
      </Suspense>
    </ThemeProvider>
  )
}
