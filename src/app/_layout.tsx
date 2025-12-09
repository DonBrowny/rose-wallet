import { DB_NAME } from '@/types/constants'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TourGuideOverlay, TourGuideProvider } from '@wrack/react-native-tour-guide'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { Stack } from 'expo-router'
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite'
import { StatusBar } from 'expo-status-bar'
import { Suspense } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import migrations from '../drizzle/migrations'

const expoDb = openDatabaseSync(DB_NAME)
const db = drizzle(expoDb)

const ONE_MINUTE = 1000 * 60

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ONE_MINUTE,
      retry: 1,
    },
  },
})

export default function Root() {
  const { theme } = useUnistyles()
  const background = theme.colors.background
  const barStyle = 'dark'
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
    <Suspense fallback={<ActivityIndicator size='large' />}>
      <QueryClientProvider client={queryClient}>
        <SQLiteProvider
          databaseName={DB_NAME}
          options={{ enableChangeListener: true }}
          useSuspense
        >
          <TourGuideProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen
                name='index'
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='(tabs)'
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='(shared)'
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='onboarding'
                options={{ headerShown: false }}
              />
            </Stack>
            <StatusBar
              style={barStyle}
              backgroundColor={background}
              translucent
            />
            <TourGuideOverlay />
          </TourGuideProvider>
        </SQLiteProvider>
      </QueryClientProvider>
    </Suspense>
  )
}
