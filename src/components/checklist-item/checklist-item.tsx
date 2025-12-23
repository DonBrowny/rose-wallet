import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import { Check, Lock } from 'lucide-react-native'
import { View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './checklist-item.style'

export type ChecklistStatus = 'pending' | 'completed' | 'locked'

interface ChecklistItemProps {
  title: string
  status: ChecklistStatus
  progress?: string
  onPress: () => void
}

export function ChecklistItem({ title, status, progress, onPress }: ChecklistItemProps) {
  const { theme } = useUnistyles()

  const isLocked = status === 'locked'
  const isCompleted = status === 'completed'

  const getButtonTitle = () => {
    if (isCompleted) return 'Done'
    if (isLocked) return 'Locked'
    return 'Start'
  }

  const getIconStyle = () => {
    if (isCompleted) return styles.iconCompleted
    if (isLocked) return styles.iconLocked
    return styles.iconPending
  }

  const renderIcon = () => {
    if (isCompleted) {
      return (
        <Check
          size={18}
          color={theme.colors.surface}
        />
      )
    }
    if (isLocked) {
      return (
        <Lock
          size={16}
          color={theme.colors.textMuted}
        />
      )
    }
    return null
  }

  return (
    <View style={[styles.container, isLocked && styles.containerLocked]}>
      <View style={[styles.iconContainer, getIconStyle()]}>{renderIcon()}</View>
      <View style={styles.content}>
        <Text variant='pMdBold'>{title}</Text>
        {progress && !isCompleted && (
          <Text
            variant='pSm'
            color='muted'
          >
            {progress}
          </Text>
        )}
      </View>
      <Button
        title={getButtonTitle()}
        type={isCompleted ? 'outline' : 'solid'}
        disabled={isLocked}
        onPress={onPress}
      />
    </View>
  )
}
