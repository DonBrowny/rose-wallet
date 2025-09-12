import { Avatar, Text } from '@rneui/themed'
import React from 'react'
import { View } from 'react-native'
import { useStyles } from './home-header.style'

export function HomeHeader() {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View testID='avatar'>
          <Avatar
            size={48}
            rounded
            source={{
              uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
            }}
            containerStyle={styles.avatarContainer}
            avatarStyle={styles.avatar}
          />
        </View>

        <View style={styles.textContainer}>
          <Text h4>Hey,</Text>
          <Text>Welcome back!</Text>
        </View>
      </View>
    </View>
  )
}
