import { Text } from '@/components/ui/text/text'
import { Image } from 'expo-image'
import LottieView from 'lottie-react-native'
import { View } from 'react-native'
import { useStyles } from './loading.styles'

interface LoadingProps {
  title?: string
  description?: string
  showImage?: boolean
}

export const Loading = ({
  title = 'Loading...',
  description = 'Please wait while we process your request',
  showImage = true,
}: LoadingProps) => {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      {showImage && (
        <Image
          source={require('@/assets/images/read.png')}
          style={styles.image}
          contentFit='contain'
          transition={200}
        />
      )}

      <Text
        variant='h4'
        style={styles.centerText}
      >
        {title}
      </Text>
      <Text
        variant='pSm'
        color='muted'
        style={styles.centerText}
      >
        {description}
      </Text>

      <LottieView
        source={require('../../assets/animations/loading_files.json')}
        autoPlay
        loop
        style={styles.lottieAnimation}
        resizeMode='contain'
        onAnimationFailure={() => {
          console.log('Lottie animation failed to load')
        }}
      />
    </View>
  )
}
