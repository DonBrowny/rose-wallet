import { Text } from '@/components/ui/text/text'
import { Pressable, ViewStyle } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './category-chip.style'

interface CategoryChipProps {
  label: string
  isSelected: boolean
  onPress: () => void
  disabled?: boolean
  style?: ViewStyle
}

export function CategoryChip({ label, isSelected, onPress, disabled = false, style }: CategoryChipProps) {
  const { theme } = useUnistyles()

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={{ selected: isSelected, disabled }}
      disabled={disabled}
      onPress={onPress}
      android_ripple={{
        color: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(111,108,217,0.25)',
        borderless: false,
        foreground: true,
      }}
      style={[styles.container(isSelected, disabled), style]}
    >
      <Text
        variant='pSmBold'
        color={isSelected ? theme.colors.surface : theme.colors.primary}
      >
        {label}
      </Text>
    </Pressable>
  )
}
