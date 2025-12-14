import { useRouter } from 'expo-router'
import { Plus } from 'lucide-react-native'
import { useCallback, useEffect, useRef } from 'react'
import { Animated, Pressable } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './fab.styles'

interface FabProps {
  visible?: boolean
}

export function Fab({ visible = true }: FabProps) {
  const router = useRouter()
  const { theme } = useUnistyles()
  const scaleAnim = useRef(new Animated.Value(visible ? 1 : 0)).current

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
    }).start()
  }, [visible, scaleAnim])

  const handlePress = useCallback(() => {
    router.push('/(shared)/add-expense')
  }, [router])

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
      pointerEvents='box-none'
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        accessibilityRole='button'
        accessibilityLabel='Add expense'
      >
        <Plus
          size={28}
          color={theme.colors.surface}
          strokeWidth={2.5}
        />
      </Pressable>
    </Animated.View>
  )
}
