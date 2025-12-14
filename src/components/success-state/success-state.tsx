import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import LottieView from 'lottie-react-native'
import { View } from 'react-native'
import { styles } from './success-state.styles'

interface SuccessStateProps {
  title: string
  description?: string
  buttonTitle?: string
  onButtonPress: () => void
}

export function SuccessState({
  title,
  description,
  buttonTitle = 'Back to Home',
  onButtonPress,
}: SuccessStateProps) {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('@/assets/animations/congratulations.json')}
        autoPlay
        loop={false}
        style={styles.lottieAnimation}
        resizeMode='contain'
      />
      <Text
        variant='h4'
        style={styles.title}
      >
        {title}
      </Text>
      {description && (
        <Text
          variant='pMd'
          color='muted'
          style={styles.description}
        >
          {description}
        </Text>
      )}
      <Button
        title={buttonTitle}
        onPress={onButtonPress}
        containerStyle={styles.button}
      />
    </View>
  )
}
