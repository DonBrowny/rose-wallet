import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import { storage } from '@/utils/mmkv/storage'
import { router } from 'expo-router'
import { CheckCircle2, CircleAlert, Sparkles } from 'lucide-react-native'
import { useMemo } from 'react'
import { View } from 'react-native'
import { styles } from './getting-started.style'

export function GettingStartedScreen() {
  const isPatternDiscoveryDone = storage.getBoolean(MMKV_KEYS.PATTERNS.IS_PATTERN_DISCOVERY_COMPLETED) === true
  const hasScannedSms = typeof storage.getNumber(MMKV_KEYS.SMS.LAST_READ_AT) === 'number'

  const completion = useMemo(() => {
    const steps = [isPatternDiscoveryDone, hasScannedSms]
    const done = steps.filter(Boolean).length
    return { done, total: steps.length }
  }, [hasScannedSms, isPatternDiscoveryDone])

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.row}>
          <Sparkles
            size={24}
            color='#8E8E93'
          />
          <Text variant='h3'>Getting Started</Text>
        </View>
        <Text
          variant='pSm'
          color='muted'
          style={styles.subtitle}
        >
          Follow these steps to set up Rosie. {completion.done}/{completion.total} completed.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            {isPatternDiscoveryDone ? (
              <CheckCircle2
                size={20}
                color='#34C759'
              />
            ) : (
              <CircleAlert
                size={20}
                color='#FF9F0A'
              />
            )}
            <View style={styles.rowMain}>
              <Text variant='aMdBold'>Review SMS patterns</Text>
              <Text
                variant='pSm'
                color='muted'
              >
                Teach Rosie to understand your bank SMS formats.
              </Text>
            </View>
            <View style={styles.pill}>
              <Text variant='pMd'>{isPatternDiscoveryDone ? 'Completed' : 'Pending'}</Text>
            </View>
          </View>
          <View style={styles.actionsRow}>
            <Button
              title='Open SMS Patterns'
              onPress={() => router.push('/(shared)/patterns' as any)}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            {hasScannedSms ? (
              <CheckCircle2
                size={20}
                color='#34C759'
              />
            ) : (
              <CircleAlert
                size={20}
                color='#FF9F0A'
              />
            )}
            <View style={styles.rowMain}>
              <Text variant='aMdBold'>Scan recent SMS</Text>
              <Text
                variant='pSm'
                color='muted'
              >
                Import transactions from your SMS inbox.
              </Text>
            </View>
            <View style={styles.pill}>
              <Text variant='pMd'>{hasScannedSms ? 'Completed' : 'Pending'}</Text>
            </View>
          </View>
          <View style={styles.actionsRow}>
            <Button
              title='Add Expense from SMS'
              onPress={() => router.push('/(shared)/add-expense' as any)}
            />
          </View>
        </View>
      </View>
    </View>
  )
}
