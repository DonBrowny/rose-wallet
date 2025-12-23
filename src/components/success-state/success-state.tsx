import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import LottieView from 'lottie-react-native'
import { View } from 'react-native'
import { styles } from './success-state.styles'

interface SuccessStateProps {
  title: string
  description?: string
  buttonTitle?: string
  onButtonPress?: () => void
  onAnimationFinish?: () => void
}

export function SuccessState({ title, description, buttonTitle, onButtonPress, onAnimationFinish }: SuccessStateProps) {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('@/assets/animations/congratulations.json')}
        autoPlay
        loop={false}
        style={styles.lottieAnimation}
        resizeMode='contain'
        onAnimationFinish={onAnimationFinish}
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
      {buttonTitle && onButtonPress && (
        <Button
          title={buttonTitle}
          onPress={onButtonPress}
          containerStyle={styles.button}
        />
      )}
    </View>
  )
}
