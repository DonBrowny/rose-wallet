import { Text } from '@/components/ui/text/text'
import { useBudgetContext } from '@/contexts/budget-context'
import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native'
import { styles } from './onboarding-budget-setup.style'

interface OnboardingBudgetSetupProps {
  onSaved?: (value: number) => void
}

export interface OnboardingBudgetSetupRef {
  save: () => boolean
}

export const OnboardingBudgetSetup = forwardRef<OnboardingBudgetSetupRef, OnboardingBudgetSetupProps>(
  function OnboardingBudgetSetup({ onSaved }: OnboardingBudgetSetupProps, ref) {
    const { monthlyBudget, budgetChangeHandler } = useBudgetContext()
    const [value, setValue] = useState(String(monthlyBudget))

    const save = useCallback(() => {
      const n = Number(value)
      if (!Number.isFinite(n) || n <= 0) return false
      budgetChangeHandler(n)
      onSaved?.(n)
      return true
    }, [budgetChangeHandler, onSaved, value])

    useImperativeHandle(ref, () => ({ save }), [save])

    return (
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <View style={styles.container}>
          <Text variant='h3'>Set Your Monthly Budget</Text>
          <Text
            variant='pMd'
            color='muted'
          >
            You can change this later from Budget.
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              accessibilityLabel='Monthly Budget'
              inputMode='numeric'
              keyboardType='decimal-pad'
              value={value}
              onChangeText={setValue}
              placeholder='Enter amount'
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    )
  }
)
