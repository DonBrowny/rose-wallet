import { Text } from '@/components/ui/text/text'
import { ChevronRight } from 'lucide-react-native'
import { View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { Card } from '../ui/card/card'
import { styles } from './settings-item.styles'

interface SettingsItemProps {
  header: string
  subHeader: string
}

export const SettingsItem = ({ header, subHeader }: SettingsItemProps) => {
  const { theme } = useUnistyles()

  return (
    <Card style={styles.container}>
      <View style={styles.textContainer}>
        <Text variant='pMdBold'>{header}</Text>
        <Text
          variant='pSm'
          color='muted'
        >
          {subHeader}
        </Text>
      </View>
      <ChevronRight
        size={24}
        color={theme.colors.grey4}
      />
    </Card>
  )
}
