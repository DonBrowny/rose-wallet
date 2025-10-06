import { Text } from '@/components/ui/text/text'
import React from 'react'
import { Pressable, TextInput, type TextInputProps, View, type ViewStyle } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './input-styles'

interface Props extends Omit<TextInputProps, 'style'> {
  label?: string
  helperText?: string
  errorMessage?: string
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
  containerStyle?: ViewStyle
}

export function Input({
  label,
  helperText,
  errorMessage,
  leftContent,
  rightContent,
  containerStyle,
  editable = true,
  ...rest
}: Props) {
  const { theme } = useUnistyles()
  const [focused, setFocused] = React.useState(false)
  const hasError = Boolean(errorMessage)
  const disabled = editable === false
  const inputRef = React.useRef<TextInput>(null)

  return (
    <View style={[styles.container, containerStyle ? containerStyle : undefined]}>
      {label ? (
        <Text
          variant='pMd'
          color='muted'
        >
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={() => {
          if (!disabled) inputRef.current?.focus()
        }}
        style={styles.inputContainer(focused, hasError, disabled)}
      >
        {leftContent ? <View pointerEvents='none'>{leftContent}</View> : null}
        <TextInput
          ref={inputRef}
          {...rest}
          editable={editable}
          onFocus={(e) => {
            setFocused(true)
            rest?.onFocus?.(e)
          }}
          onBlur={(e) => {
            rest?.onBlur?.(e)
          }}
          onEndEditing={(e) => {
            setFocused(false)
            rest?.onEndEditing?.(e)
          }}
          style={styles.input}
          placeholderTextColor={theme.colors.textMuted}
          selectionColor={theme.colors.primary}
        />
        {rightContent ? <View pointerEvents='none'>{rightContent}</View> : null}
      </Pressable>

      {helperText && !errorMessage ? (
        <Text
          variant='pSm'
          color='muted'
        >
          {helperText}
        </Text>
      ) : null}

      {errorMessage ? (
        <Text
          variant='pSm'
          color='danger'
        >
          {errorMessage}
        </Text>
      ) : null}
    </View>
  )
}
