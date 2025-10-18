import { Button } from '@/components/ui/button/button'
import { Overlay } from '@/components/ui/overlay/overlay'
import { Text } from '@/components/ui/text/text'
import { Image } from 'expo-image'
import { CheckCircle2 } from 'lucide-react-native'
import React, { useState } from 'react'
import { Linking, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './onboarding-privacy.style'

export function OnboardingPrivacy() {
  const { theme } = useUnistyles()
  const [isSmsInfoVisible, setIsSmsInfoVisible] = useState(false)

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/privacy.png')}
        style={styles.imageContainer}
        contentFit='contain'
      />

      <Text
        variant='h3'
        color='primary'
      >
        Privacy & Data Security
      </Text>

      <Text
        variant='pMd'
        color='primary'
      >
        We take privacy seriously. Rose Wallet is designed to ensure that your data remains in your control. Here’s how
        we handle your information:
      </Text>

      <View style={styles.list}>
        <View style={styles.itemRow}>
          <CheckCircle2
            size={18}
            color={theme.colors.primary}
          />
          <Text
            variant='pMd'
            color='muted'
            style={styles.bulletText}
          >
            We do not collect, store, or sell any personal data.
          </Text>
        </View>

        <View style={styles.itemRow}>
          <CheckCircle2
            size={18}
            color={theme.colors.primary}
          />
          <Text
            variant='pMd'
            color='muted'
            style={styles.bulletText}
          >
            Your saved links are stored only on your device.
          </Text>
        </View>

        <View style={styles.itemRow}>
          <CheckCircle2
            size={18}
            color={theme.colors.primary}
          />
          <Text
            variant='pMd'
            color='muted'
            style={styles.bulletText}
          >
            We do not track your activity or share your data with third parties.
          </Text>
        </View>

        <View style={styles.itemRow}>
          <CheckCircle2
            size={18}
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
              onPress={() => setIsSmsInfoVisible(true)}
              style={styles.linkText}
            >
              know why we read your SMS?
            </Text>
          </Text>
        </View>
      </View>

      <Overlay
        testID='sms-permission-info'
        isVisible={isSmsInfoVisible}
        onBackdropPress={() => setIsSmsInfoVisible(false)}
        overlayStyle={styles.overlay}
      >
        <View style={styles.overlayContent}>
          <Text
            variant='h4'
            style={styles.overlayTitle}
          >
            Why we need SMS access
          </Text>
          <Text
            variant='pMd'
            color='muted'
          >
            We only process SMS from verified financial senders (banks, cards, UPI) and ignore OTPs, promotions, and
            personal chats.
          </Text>
          <Text
            variant='pMd'
            color='muted'
          >
            The algorithm is designed to extract the data from the sms and generate patterns for data extraction. Users
            can confirm or correct the data if needed.
          </Text>
          <Text
            variant='pMd'
            color='muted'
          >
            The data we extract from the sms are the bank name, amount, date and merchant name. All the extraction
            happens on your device.
          </Text>
          <Text
            variant='pMd'
            color='muted'
          >
            Nothing leaves your device. We store only derived transaction records, not full SMS content.
          </Text>
          <Text
            variant='pMd'
            color='muted'
          >
            You can revoke SMS permission anytime in your device settings.
          </Text>
          <Text
            variant='pMd'
            color='muted'
          >
            If you have any questions about this privacy policy, feel free to contact us at{' '}
            <Text
              color='primary'
              style={styles.linkText}
              accessibilityRole='link'
              onPress={() => Linking.openURL('mailto:kishore13ask@gmail.com')}
            >
              kishore13ask@gmail.com
            </Text>
            .
          </Text>
          <Button
            title='Got it'
            onPress={() => setIsSmsInfoVisible(false)}
          />
        </View>
      </Overlay>
    </View>
  )
}
