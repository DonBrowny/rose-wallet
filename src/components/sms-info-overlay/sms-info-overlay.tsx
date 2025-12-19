import { Button } from '@/components/ui/button/button'
import { Overlay } from '@/components/ui/overlay/overlay'
import { Text } from '@/components/ui/text/text'
import React from 'react'
import { Linking, ScrollView, View } from 'react-native'
import { styles } from './sms-info-overlay.style'

interface SmsInfoOverlayProps {
  isVisible: boolean
  onClose: () => void
}

export function SmsInfoOverlay({ isVisible, onClose }: SmsInfoOverlayProps) {
  return (
    <Overlay
      testID='sms-permission-info'
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={styles.overlay}
    >
      <View style={styles.content}>
        <Text
          variant='h4'
          style={styles.title}
        >
          Why we need SMS access
        </Text>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
          </Text>
        </ScrollView>
        <Button
          title='Got it'
          onPress={onClose}
        />
      </View>
    </Overlay>
  )
}
