import {
  OnboardingBudgetSetup,
  OnboardingBudgetSetupRef,
} from '@/components/onboarding-budget-setup/onboarding-budget-setup'
import { OnboardingIntro } from '@/components/onboarding-intro/onboarding-intro'
import { OnboardingPrivacy } from '@/components/onboarding-privacy/onboarding-privacy'
import { Button } from '@/components/ui/button/button'
import { ProgressStepper } from '@/components/ui/progress-stepper/progress-stepper'
import { BudgetProvider } from '@/contexts/budget-context'
import { SMSPermissionService } from '@/services/sms-parsing/sms-permission-service'
import { MMKV_KEYS } from '@/types/mmkv-keys'
import { storage } from '@/utils/mmkv/storage'
import { useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'
import React, { useRef, useState } from 'react'
import { View } from 'react-native'
import Animated, { FadeInLeft, FadeInRight, FadeOutLeft, FadeOutRight } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './onboarding-screen.styles'

export function OnboardingScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'next' | 'back'>('next')
  const budgetRef = useRef<OnboardingBudgetSetupRef>(null)

  const goNext = () => {
    setStep((s) => {
      const target = Math.min(2, s + 1)
      setDirection('next')
      return target
    })
  }

  const goBack = () => {
    setStep((s) => {
      const target = Math.max(0, s - 1)
      setDirection('back')
      return target
    })
  }

  const handlePermissionRequest = async () => {
    await SMSPermissionService.requestPermissionWithExplanation()
    setStep((s) => {
      const target = Math.min(2, s + 1)
      setDirection('next')
      return target
    })
  }

  const handleFinish = () => {
    const saved = budgetRef.current?.save()
    if (saved === false) {
      return
    }
    storage.set(MMKV_KEYS.APP.ONBOARDING_COMPLETED, 'true')
    router.replace('/(tabs)')
  }

  return (
    <BudgetProvider>
      <SafeAreaView style={styles.container}>
        <ProgressStepper
          currentIndex={step}
          total={3}
          style={styles.stepper}
        />

        <Animated.View
          key={step}
          entering={(direction === 'next' ? FadeInRight : FadeInLeft).duration(200)}
          exiting={(direction === 'next' ? FadeOutLeft : FadeOutRight).duration(200)}
          style={styles.content}
        >
          {step === 0 && <OnboardingIntro />}
          {step === 1 && <OnboardingPrivacy />}
          {step === 2 && <OnboardingBudgetSetup ref={budgetRef} />}
        </Animated.View>

        {step === 0 ? (
          <View style={styles.buttonContainer}>
            <Button
              title='Get Started'
              onPress={goNext}
              containerStyle={styles.ctaButton}
            />
          </View>
        ) : (
          <View style={styles.footer}>
            <>
              <Button
                title='Back'
                type='outline'
                onPress={goBack}
                disabled={step === 0}
                leftIcon={
                  <ArrowLeft
                    size={18}
                    color={theme.colors.primary}
                  />
                }
                containerStyle={styles.footerButton}
              />
              {step < 2 ? (
                <Button
                  title='Next'
                  onPress={step === 1 ? handlePermissionRequest : goNext}
                  rightIcon={
                    <ArrowRight
                      size={18}
                      color={theme.colors.surface}
                    />
                  }
                  containerStyle={styles.footerButton}
                />
              ) : (
                <Button
                  title='Finish'
                  onPress={handleFinish}
                  containerStyle={styles.footerButton}
                />
              )}
            </>
          </View>
        )}
      </SafeAreaView>
    </BudgetProvider>
  )
}
