import { SmsInfoOverlay } from '@/components/sms-info-overlay/sms-info-overlay'
import { Text } from '@/components/ui/text/text'
import { Image } from 'expo-image'
import { CheckCircle2 } from 'lucide-react-native'
import React, { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './onboarding-privacy.style'

const ICON_SIZE = 18

const PRIVACY_POINTS = [
  'We do not collect, store, or sell any personal data.',
  'Your saved links are stored only on your device.',
  'We do not track your activity or share your data with third parties.',
]

export function OnboardingPrivacy() {
  const { theme } = useUnistyles()
  const [isSmsInfoVisible, setIsSmsInfoVisible] = useState(false)

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Image
        source={require('@/assets/images/privacy.png')}
        style={styles.imageContainer}
        contentFit='contain'
        accessibilityLabel='Privacy and security illustration'
      />

      <Text
        variant='h4'
        color='primary'
      >
        Privacy & Data Security
      </Text>

      <Text
        variant='pMd'
        color='primary'
      >
        We take privacy seriously. Rose Wallet is designed to ensure that your data remains in your control. Here is how
        we handle your information:
      </Text>

      <View style={styles.list}>
        {PRIVACY_POINTS.map((point) => (
          <View
            key={point}
            style={styles.itemRow}
          >
            <CheckCircle2
              size={ICON_SIZE}
              color={theme.colors.primary}
            />
            <Text
              variant='pMd'
              color='muted'
              style={styles.bulletText}
            >
              {point}
            </Text>
          </View>
        ))}

        <View style={styles.itemRow}>
          <CheckCircle2
            size={ICON_SIZE}
            color={theme.colors.primary}
          />
          <Text
            variant='pMd'
            color='muted'
            style={styles.bulletText}
          >
            Reads SMS only after you allow permission -{' '}
            <Text
              color='primary'
              accessibilityRole='link'
              onPress={() => setIsSmsInfoVisible(true)}
              style={styles.linkText}
            >
              know why we read your SMS?
            </Text>
          </Text>
        </View>
      </View>

      <SmsInfoOverlay
        isVisible={isSmsInfoVisible}
        onClose={() => setIsSmsInfoVisible(false)}
      />
    </ScrollView>
  )
}
