import '@/global.css'
import { ThemeProvider } from '@/lib/theme-context'
import { PortalHost } from '@rn-primitives/portal'
import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <PortalHost />
    </ThemeProvider>
  )
}
