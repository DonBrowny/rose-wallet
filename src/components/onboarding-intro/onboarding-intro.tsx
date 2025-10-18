import { Text } from '@/components/ui/text/text'
import { Image } from 'expo-image'
import React from 'react'
import { View } from 'react-native'
import { styles } from './onboarding-intro.style'

export function OnboardingIntro() {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/wave.png')}
        style={{ width: 200, height: 200 }}
        contentFit='contain'
      />
      <Text
        variant='h3'
        color='primary'
      >
        Hi, I am Rose
      </Text>
      <Text
        variant='pMd'
        style={styles.text}
      >
        I will help you to track expenses from SMS and manage budgets.
      </Text>
    </View>
  )
}
