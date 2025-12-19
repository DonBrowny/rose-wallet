import { Text } from '@/components/ui/text/text'
import { CheckCircle2, Clock, Lock, LucideIcon, XCircle } from 'lucide-react-native'
import { View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './status-pill.style'

const ICON_SIZE = 14

export type PillStatus = 'completed' | 'pending' | 'locked' | 'rejected'

interface StatusPillProps {
  status: PillStatus
}

export function StatusPill({ status }: StatusPillProps) {
  const { theme } = useUnistyles()

  const config: Record<PillStatus, { icon: LucideIcon; label: string; style: object }> = {
    completed: { icon: CheckCircle2, label: 'Completed', style: styles.done },
    pending: { icon: Clock, label: 'Not started', style: styles.pending },
    locked: { icon: Lock, label: 'Locked', style: styles.locked },
    rejected: { icon: XCircle, label: 'Rejected', style: styles.rejected },
  }

  const { icon: Icon, label, style } = config[status]

  return (
    <View style={[styles.container, style]}>
      <Icon
        size={ICON_SIZE}
        color={theme.colors.background}
      />
      <Text
        variant='pSmBold'
        color={theme.colors.background}
      >
        {label}
      </Text>
    </View>
  )
}
