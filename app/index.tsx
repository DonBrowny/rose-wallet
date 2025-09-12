import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { THEME } from '@/lib/theme'
import { useTheme } from '@/lib/theme-context'
import { LinearGradient } from 'expo-linear-gradient'
import { View } from 'react-native'

export default function HomeScreen() {
  const { themeMode, isDark } = useTheme()
  const theme = THEME[themeMode]

  // Helper function to create variations of a color by adjusting lightness
  const createColorVariations = (baseColor: string, lightnessValues: number[]) => {
    // Extract HSL values from the base color
    const hslMatch = baseColor.match(/hsl\((\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\)/)
    if (!hslMatch) return [baseColor]

    const [, hue, saturation] = hslMatch
    return lightnessValues.map((lightness) => `hsl(${hue} ${saturation}% ${lightness}%)`)
  }

  // Garden-themed gradients using your app's pastel color palette
  const gardenColors = [
    theme.background, // Background
    theme.muted, // Muted
    ...createColorVariations(theme.primary, isDark ? [51, 45, 40, 35, 30] : [80, 75, 70, 65, 60]), // Primary variations
  ]

  return (
    <LinearGradient
      // @ts-ignore this cannot be typed
      colors={gardenColors}
      locations={[0, 0.15, 0.3, 0.5, 0.7, 0.85, 1]}
      className='flex-1'
    >
      <View className='flex-1'>
        {/* Header with app name and theme toggle */}
        <View className='flex-row items-center justify-between px-6 pt-16 pb-6'>
          <Text className='text-3xl font-bold text-foreground tracking-tight'>Rose Wallet</Text>
          <ThemeToggle />
        </View>

        {/* Main content */}
        <View className='flex-1 items-center justify-center px-6'>
          <Card className='w-full shadow-lg border-border/50'>
            <CardHeader className='space-y-2 pb-4'>
              <CardTitle className='text-xl font-semibold text-center'>Welcome to Rose Wallet</CardTitle>
              <CardDescription className='text-center text-muted-foreground'>
                Your beautiful garden-themed wallet experience
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Text className='text-center leading-relaxed'>
                Experience the perfect blend of nature and technology with our garden-inspired interface that adapts to
                your preferences.
              </Text>
              <View className='flex-row items-center justify-center gap-2 pt-2'>
                <View className='w-3 h-3 rounded-full border-2 border-border bg-secondary' />
                <View className='w-3 h-3 rounded-full border-2 border-border bg-secondary' />
                <View className='w-3 h-3 rounded-full border-2 border-border bg-secondary' />
              </View>
            </CardContent>
            <CardFooter className='pt-4'>
              <Button className='w-full'>
                <Text className='font-bold'>Get Started</Text>
              </Button>
            </CardFooter>
          </Card>
        </View>
      </View>
    </LinearGradient>
  )
}
