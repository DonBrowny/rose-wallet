import { SettingsItem } from '@/components/settings-item/settings-item'
import { Text } from '@/components/ui/text/text'
import { router } from 'expo-router'
import { Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styles } from './settings-screen.styles'

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
          <Pressable
            key={item.id}
            onPress={() => {
              router.navigate(item.href as any)
            }}
          >
            <SettingsItem
              header={item.header}
              subHeader={item.subHeader}
            />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  )
}
