import { getDrizzleDb } from '@/services/database/db'
import { appMigrations, runMigrations } from '@/services/migrations'
import { DB_NAME } from '@/types/constants'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TourGuideOverlay, TourGuideProvider } from '@wrack/react-native-tour-guide'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { Stack } from 'expo-router'
import { SQLiteProvider } from 'expo-sqlite'
import { StatusBar } from 'expo-status-bar'
import { Suspense, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { useUnistyles } from 'react-native-unistyles'
import migrations from '../drizzle/migrations'

const db = getDrizzleDb()

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
  const [appMigrationsComplete, setAppMigrationsComplete] = useState(false)
  const [migrationError, setMigrationError] = useState<string | null>(null)
  const migrationRunning = useRef(false)

  useEffect(() => {
    if (success && !appMigrationsComplete && !migrationRunning.current) {
      migrationRunning.current = true
      runMigrations(appMigrations).then((result) => {
        if (!result.success) {
          setMigrationError(result.error ?? 'Unknown error')
        } else {
          setAppMigrationsComplete(true)
        }
      })
    }
  }, [success, appMigrationsComplete])

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
  if (migrationError) {
    return (
      <View>
        <Text>App migration error: {migrationError}</Text>
      </View>
    )
  }
  if (!appMigrationsComplete) {
    return (
      <View>
        <Text>Setting up app...</Text>
      </View>
    )
  }

  return (
    <Suspense fallback={<ActivityIndicator size='large' />}>
      <KeyboardProvider>
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
      </KeyboardProvider>
    </Suspense>
  )
}
