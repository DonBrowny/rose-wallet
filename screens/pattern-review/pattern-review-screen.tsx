import { Text } from '@/components/ui/text'
import { updatePatternStatusById } from '@/services/database/patterns-repository'
import type { Transaction } from '@/types/sms/transaction'
import { getPatternSamplesByName } from '@/utils/mmkv/pattern-samples'
import { Button } from '@rneui/themed'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { ScrollView, View } from 'react-native'
import { useStyles } from './pattern-review-screen.styles'

interface PatternReviewScreenProps {
  id: number
  groupingTemplate: string
  name: string
  template: string
  status: string
}

export function PatternReviewScreen({ id, groupingTemplate, name, template, status }: PatternReviewScreenProps) {
  const styles = useStyles()
  const router = useRouter()

  const samples: Transaction[] = useMemo(() => {
    return getPatternSamplesByName(name)
  }, [name])

  const handleApprove = async () => {
    await updatePatternStatusById(Number(id), 'approved')
    router.back()
  }

  const handleNeedsWork = async () => {
    await updatePatternStatusById(Number(id), 'needs-review')
    router.back()
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant='h3'>Pattern review</Text>
        <Text
          variant='pSm'
          color='muted'
        >
          Confirm these look right, or mark as needs work.
        </Text>
      </View>

      <View style={styles.sampleList}>
        {samples.map((t, idx) => (
          <View
            key={`${t.id}-${idx}`}
            style={styles.sampleCard}
          >
            <Text
              variant='pSm'
              color='muted'
            >
              SMS
            </Text>
            <Text
              variant='pMd'
              style={{ marginTop: 6 }}
            >
              {t.message.body}
            </Text>
          </View>
        ))}
        {samples.length === 0 && (
          <Text
            variant='pSm'
            color='muted'
          >
            No sample messages available.
          </Text>
        )}
      </View>

      <View style={styles.actionsRow}>
        <Button
          title='Needs work'
          type='outline'
          radius='xl'
          onPress={handleNeedsWork}
        />
        <Button
          title='Approve pattern'
          radius='xl'
          onPress={handleApprove}
        />
      </View>
    </ScrollView>
  )
}
