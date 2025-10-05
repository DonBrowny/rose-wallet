import React from 'react'
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native'
import { styles } from './card-styles'

interface Props extends ViewProps {
  style?: StyleProp<ViewStyle>
  children: React.ReactNode
}

export function Card({ style, children, ...rest }: Props) {
  return (
    <View
      {...rest}
      style={[styles.container, style]}
    >
      {children}
    </View>
  )
}
