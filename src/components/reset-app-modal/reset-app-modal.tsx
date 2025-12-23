import { Button } from '@/components/ui/button/button'
import { Overlay } from '@/components/ui/overlay/overlay'
import { Text } from '@/components/ui/text/text'
import { resetApp } from '@/services/reset-app-service'
import { reloadAppAsync } from 'expo'
import { useState } from 'react'
import { View } from 'react-native'
import { styles } from './reset-app-modal.style'

interface ResetAppModalProps {
  isVisible: boolean
  onCancel: () => void
}

export function ResetAppModal({ isVisible, onCancel }: ResetAppModalProps) {
  const [isResetting, setIsResetting] = useState(false)

  function handleReset() {
    setIsResetting(true)
    resetApp()
    reloadAppAsync('Reset app data')
  }

  return (
    <Overlay
      testID='reset-app-modal'
      isVisible={isVisible}
      onBackdropPress={isResetting ? undefined : onCancel}
      overlayStyle={styles.overlay}
    >
      <View style={styles.overlayContent}>
        <Text
          variant='h4'
          style={styles.overlayTitle}
        >
          Reset App?
        </Text>

        <Text
          variant='pMd'
          color='textMuted'
          style={styles.warningText}
        >
          This will delete all your data including transactions, patterns, categories, and settings. This action cannot
          be undone.
        </Text>

        <View style={styles.overlayButtons}>
          <Button
            title='Cancel'
            type='outline'
            onPress={onCancel}
            disabled={isResetting}
            containerStyle={styles.cancelButton}
          />
          <Button
            title='Reset'
            onPress={handleReset}
            isLoading={isResetting}
            containerStyle={styles.resetButton}
          />
        </View>
      </View>
    </Overlay>
  )
}
