import { theme } from '@/theme/rne-theme'
import { ThemeProvider } from '@rneui/themed'
import { Slot } from 'expo-router'

export default function Root() {
  return (
    <ThemeProvider theme={theme}>
      <Slot />
    </ThemeProvider>
  )
}
