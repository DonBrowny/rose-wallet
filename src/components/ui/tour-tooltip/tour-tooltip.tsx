import { View } from 'react-native'
import { Button } from '../button/button'
import { styles } from './tour-tooltip.styles'

interface Props {
  children?: React.ReactNode
  onNext?: () => void
  onPrevious?: () => void
  onDone?: () => void
}

export function TourTooltip({ children, onNext, onPrevious, onDone }: Props) {
  const hasPrevious = typeof onPrevious === 'function'
  const hasNext = typeof onNext === 'function'
  const hasDone = typeof onDone === 'function'

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>{children}</View>
      <View style={styles.actionsRow}>
        {hasPrevious ? (
          <Button
            title='Previous'
            type='outline'
            containerStyle={styles.actionButtonContainer}
            onPress={onPrevious}
          />
        ) : null}
        <View style={{ flex: 1 }} />
        {hasDone ? (
          <Button
            title='Done'
            type='outline'
            containerStyle={styles.actionButtonContainer}
            onPress={onDone}
          />
        ) : hasNext ? (
          <Button
            title='Next'
            type='outline'
            containerStyle={styles.actionButtonContainer}
            onPress={onNext}
          />
        ) : null}
      </View>
    </View>
  )
}
