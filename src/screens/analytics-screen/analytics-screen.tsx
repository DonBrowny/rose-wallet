import { Text } from '@/components/ui/text/text'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { History } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './analytics-screen.styles'

export function AnalyticsScreen() {
  const { theme } = useUnistyles()

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
          color='muted'
          style={styles.constructionDescription}
        >
          We&apos;re growing powerful analytics features to help you understand your spending patterns
        </Text>
        <Link
          href='/analytics/expense-history'
          asChild
        >
          <Pressable style={styles.historyButton}>
            <History
              size={20}
              color={theme.colors.surface}
            />
            <Text
              variant='pMd'
              color='surface'
            >
              View Expense History
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  )
}
