import { PillStatus, StatusPill } from '@/components/status-pill/status-pill'
import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import { View } from 'react-native'
import { styles } from './tour-card.style'

interface TourCardProps {
  title: string
  description: string
  status: PillStatus
  buttonTitle: string
  onPress: () => void
  disabled?: boolean
  hint?: string
  locked?: boolean
}

export function TourCard({ title, description, status, buttonTitle, onPress, disabled, hint, locked }: TourCardProps) {
  return (
    <View style={[styles.container, locked && styles.locked]}>
      <View style={styles.header}>
        <Text
          variant='pLgBold'
          style={styles.title}
        >
          {title}
        </Text>
        <StatusPill status={status} />
      </View>
      <Text variant='pMd'>{description}</Text>
      {hint && (
        <Text
          variant='pSm'
          color='muted'
        >
          {hint}
        </Text>
      )}
      <Button
        title={buttonTitle}
        onPress={onPress}
        disabled={disabled}
        containerStyle={styles.button}
      />
    </View>
  )
}
