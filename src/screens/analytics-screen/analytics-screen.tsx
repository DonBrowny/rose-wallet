import { Text } from '@/components/ui/text'
import { Image } from 'expo-image'
import { View } from 'react-native'
import { useStyles } from './analytics-screen.styles'

export const AnalyticsScreen = () => {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <View style={styles.underConstructionContainer}>
        <Image
          source={require('@/assets/images/planting.png')}
          style={styles.constructionImage}
          contentFit='contain'
          transition={300}
        />
        <Text
          variant='h3'
          style={styles.constructionTitle}
        >
          Under Construction
        </Text>
        <Text
          variant='pSm'
          style={styles.constructionDescription}
        >
          We&apos;re growing powerful analytics features to help you understand your spending patterns
        </Text>
      </View>
    </View>
  )
}
