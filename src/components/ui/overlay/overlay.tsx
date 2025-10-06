import React from 'react'
import { Modal, Pressable, StyleProp, View, ViewStyle } from 'react-native'
import { styles } from './overlay-styles'

interface Props {
  isVisible: boolean
  onBackdropPress?: () => void
  overlayStyle?: StyleProp<ViewStyle>
  children?: React.ReactNode
  fullScreen?: boolean
  animationType?: 'none' | 'slide' | 'fade'
}

export function Overlay({
  isVisible,
  onBackdropPress,
  overlayStyle,
  children,
  fullScreen = false,
  animationType = 'fade',
}: Props) {
  return (
    <Modal
      visible={isVisible}
      transparent={!fullScreen}
      animationType={animationType}
      onRequestClose={onBackdropPress}
    >
      <View style={[styles.root, fullScreen && styles.fullscreen]}>
        {!fullScreen && (
          <Pressable
            accessibilityRole='button'
            style={styles.backdrop}
            onPress={onBackdropPress}
          />
        )}
        <View style={[styles.card, fullScreen && styles.fullscreen, overlayStyle]}>{children}</View>
      </View>
    </Modal>
  )
}
