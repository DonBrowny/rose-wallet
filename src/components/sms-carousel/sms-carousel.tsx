import { Text } from '@/components/ui/text'
import type { Transaction } from '@/types/sms/transaction'
import { FlashList } from '@shopify/flash-list'
import { useEffect, useMemo } from 'react'
import { Dimensions, Pressable } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useStyles } from './sms-carousel.styles'

interface SmsCarouselProps {
  data: Transaction[]
  itemSpacing?: number
  peek?: number // horizontal inset on each side to show next item
  outerPadding?: number // horizontal padding applied by parent container
}
const { width: screenWidth } = Dimensions.get('screen')

export function SmsCarousel({
  data,
  itemSpacing = 12,
  peek = 32,
  outerPadding: outerPaddingProp = 16,
}: SmsCarouselProps) {
  const styles = useStyles()

  const outerPadding = outerPaddingProp
  const viewportWidth = screenWidth - 2 * outerPadding
  const cardWidth = viewportWidth - 2 * peek
  const itemSize = cardWidth + itemSpacing

  const listData = useMemo(() => data, [data])

  const scrollX = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x
  })

  const AnimatedFlashList: any = Animated.createAnimatedComponent(FlashList)

  function CarouselItem({ item, index }: { item: Transaction; index: number }) {
    const pressedScale = useSharedValue(1)
    useEffect(() => {
      pressedScale.value = 1
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.id])

    const animatedCardStyle = useAnimatedStyle(() => {
      const relativeIndex = scrollX.value / itemSize
      const distance = relativeIndex - index
      const scale = interpolate(distance, [-1, 0, 1], [0.9, 1, 0.9], Extrapolation.CLAMP)
      const opacity = interpolate(distance, [-1, 0, 1], [0.6, 1, 0.6], Extrapolation.CLAMP)
      const translateY = interpolate(distance, [-1, 0, 1], [10, 0, 10], Extrapolation.CLAMP)
      return {
        width: cardWidth,
        opacity,
        transform: [{ translateY }, { scale: scale * pressedScale.value }],
      }
    })

    function handlePressIn() {
      pressedScale.value = withSpring(0.98, { damping: 15, stiffness: 200 })
    }
    function handlePressOut() {
      pressedScale.value = withSpring(1, { damping: 15, stiffness: 200 })
    }

    return (
      <Animated.View style={[styles.sampleCard, animatedCardStyle]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Text
            variant='pSm'
            color='muted'
          >
            SMS
          </Text>
          <Text
            variant='pMd'
            style={{ marginTop: 6 }}
          >
            {item.message.body}
          </Text>
        </Pressable>
      </Animated.View>
    )
  }

  return (
    <AnimatedFlashList
      keyExtractor={(item: Transaction) => item.id.toString()}
      horizontal
      snapToAlignment='center'
      snapToInterval={itemSize}
      decelerationRate='fast'
      showsHorizontalScrollIndicator={false}
      data={listData}
      renderItem={({ item, index }: { item: Transaction; index: number }) => (
        <CarouselItem
          item={item}
          index={index}
        />
      )}
      estimatedItemSize={itemSize}
      contentContainerStyle={{ paddingHorizontal: peek }}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  )
}
