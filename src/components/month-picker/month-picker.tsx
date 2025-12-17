import { Text } from '@/components/ui/text/text'
import { generateMonthOptions, MonthOption } from '@/utils/date/generate-month-options'
import { FlashList } from '@shopify/flash-list'
import { memo, useCallback, useMemo } from 'react'
import { Pressable, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { styles } from './month-picker.styles'

interface MonthPickerProps {
  selectedYear: number
  selectedMonth: number
  onMonthSelect: (year: number, month: number) => void
}

const PILL_WIDTH = 100
const PILL_GAP = 8

export const MonthPicker = memo(function MonthPicker({ selectedYear, selectedMonth, onMonthSelect }: MonthPickerProps) {
  const { theme } = useUnistyles()

  const monthOptions = useMemo(() => generateMonthOptions(), [])

  const handleMonthPress = useCallback(
    (year: number, month: number) => {
      onMonthSelect(year, month)
    },
    [onMonthSelect]
  )

  const renderItem = useCallback(
    ({ item }: { item: MonthOption }) => {
      const isSelected = item.year === selectedYear && item.month === selectedMonth

      return (
        <Pressable
          style={[styles.pill, isSelected && { backgroundColor: theme.colors.primary }]}
          onPress={() => handleMonthPress(item.year, item.month)}
        >
          <Text
            variant='pSm'
            color={isSelected ? 'surface' : 'muted'}
            style={isSelected && styles.selectedText}
          >
            {item.label}
          </Text>
        </Pressable>
      )
    },
    [selectedYear, selectedMonth, theme.colors.primary, handleMonthPress]
  )

  const keyExtractor = useCallback((item: MonthOption) => `${item.year}-${item.month}`, [])

  return (
    <View style={styles.container}>
      <FlashList
        data={monthOptions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={PILL_WIDTH + PILL_GAP}
        decelerationRate='fast'
      />
    </View>
  )
})
