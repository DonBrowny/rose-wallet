import { SmsCarousel } from '@/components/sms-carousel/sms-carousel'
import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import { useAppStore } from '@/hooks/use-store'
import { updatePatternStatusById } from '@/services/database/patterns-repository'
import { useRouter } from 'expo-router'
import { View } from 'react-native'
import { styles } from './pattern-review-screen.styles'

interface PatternReviewScreenProps {
  id: number
  groupingTemplate: string
  name: string
  template: string
  status: string
}

export function PatternReviewScreen({ id, groupingTemplate, name, template, status }: PatternReviewScreenProps) {
  const router = useRouter()

  const samples = useAppStore.use.patternReview().transactions

  const handleApprove = async () => {
    await updatePatternStatusById(Number(id), 'approved')
    router.back()
  }

  const handleNeedsWork = async () => {
    await updatePatternStatusById(Number(id), 'needs-review')
    router.back()
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant='h3'>Pattern review</Text>
        <Text
          variant='pSm'
          color='muted'
        >
          Confirm these look right, or mark as needs work.
        </Text>
      </View>

      <SmsCarousel
        data={samples}
        peek={16}
        outerPadding={16}
      />

      <View style={styles.actionsRow}>
        <Button
          title='Needs work'
          type='outline'
          onPress={handleNeedsWork}
        />
        <Button
          title='Approve pattern'
          onPress={handleApprove}
        />
      </View>
    </View>
  )
}
