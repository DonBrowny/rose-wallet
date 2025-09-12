import { Input, useTheme } from '@rneui/themed'
import React from 'react'

export function ThemedInput(props: any) {
  const { theme } = useTheme()
  const [focused, setFocused] = React.useState(false)

  return (
    <Input
      {...props}
      onFocus={(e) => {
        setFocused(true)
        props?.onFocus?.(e)
      }}
      onBlur={(e) => {
        setFocused(false)
        props?.onBlur?.(e)
      }}
      inputContainerStyle={[
        {
          borderColor: focused ? theme.colors?.primary : props.errorMessage ? theme.colors?.error : theme.colors?.input,
        },
      ]}
    />
  )
}
