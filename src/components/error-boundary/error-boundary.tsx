import { Button } from '@/components/ui/button/button'
import { Text } from '@/components/ui/text/text'
import { AlertTriangle } from 'lucide-react-native'
import { ReactNode } from 'react'
import { FallbackProps, ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './error-boundary.style'

const ICON_SIZE = 40

function DefaultFallback({ resetErrorBoundary }: FallbackProps) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.container}>
      <AlertTriangle
        size={ICON_SIZE}
        color={theme.colors.error}
      />
      <Text variant='h5'>Something went wrong</Text>
      <Text
        variant='pMd'
        color='muted'
        style={styles.message}
      >
        The app hit an unexpected error. You can try again, or restart the app if it keeps happening.
      </Text>
      <Button
        title='Try again'
        onPress={resetErrorBoundary}
        containerStyle={styles.button}
      />
    </View>
  )
}

interface ErrorBoundaryProps {
  children: ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={DefaultFallback}
      onError={(error, info) => console.error('Unhandled error caught by ErrorBoundary', error, info)}
    >
      {children}
    </ReactErrorBoundary>
  )
}
