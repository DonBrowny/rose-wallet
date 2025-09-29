import { SettingsItem } from '@/components/settings-item/settings-item'
import { Text } from '@/components/ui/text'
import { Button } from '@rneui/themed'
import { router } from 'expo-router'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useStyles } from './settings-screen.styles'

const settingsItems = [
  {
    id: 'patterns',
    header: 'SMS Patterns',
    subHeader: 'Teach Rosie how to parse your SMS messages',
    href: '/(shared)/patterns',
  },
  {
    id: 'about',
    header: 'About',
    subHeader: 'App version and information',
    href: '/(tabs)/settings/about',
  },
]

export const SettingsScreen = () => {
  const styles = useStyles()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text
          variant='h3'
          style={styles.title}
        >
          Settings
        </Text>
        {settingsItems.map((item) => (
          <Button
            key={item.id}
            type='outline'
            title={
              <SettingsItem
                header={item.header}
                subHeader={item.subHeader}
              />
            }
            onPress={() => {
              router.push(item.href as any)
            }}
          />
        ))}
      </View>
    </SafeAreaView>
  )
}
