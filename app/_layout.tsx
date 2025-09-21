import { HeaderBackButton } from '@/components/header-back-button/header-back-button'
import { TabBarButton } from '@/components/tab-bar-button/tab-bar-button'
import { useTabBarVisibility } from '@/hooks/use-tab-bar-visibility'
import { theme } from '@/theme/rne-theme'
import { ThemeProvider } from '@rneui/themed'
import { Tabs } from 'expo-router'
import { BarChart3, Home, Plus, Settings } from 'lucide-react-native'

export default function Root() {
  const { shouldHideTabBar } = useTabBarVisibility()

  return (
    <ThemeProvider theme={theme}>
      <Tabs
        screenOptions={{
          tabBarStyle: shouldHideTabBar
            ? { display: 'none' }
            : {
                position: 'absolute',
                bottom: 24,
                height: 60,
                backgroundColor: theme.lightColors?.white, // ink7 = white
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
              },
          tabBarActiveTintColor: theme.lightColors?.primary, // Use theme primary color for active
          tabBarInactiveTintColor: theme.lightColors?.grey3, // Use theme grey3 for inactive
          tabBarItemStyle: {
            marginVertical: 4,
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          },
          tabBarButton: (props) => <TabBarButton {...props} />,
          tabBarShowLabel: false,
          animation: 'shift',
        }}
      >
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
            tabBarStyle: { display: 'none' },
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
    </ThemeProvider>
  )
}
