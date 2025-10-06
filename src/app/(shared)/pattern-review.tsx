import { Text } from '@/components/ui/text/text'
import { patterns } from '@/db/schema'
import { useAppStore } from '@/hooks/use-store'
import { PatternReviewScreen } from '@/screens/pattern-review/pattern-review-screen'
import { getPatternSamplesByName } from '@/utils/mmkv/pattern-samples'
import { eq } from 'drizzle-orm'
import { drizzle, useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useEffect, useMemo } from 'react'
import { View } from 'react-native'

export default function PatternReviewRoute() {
  const params = useLocalSearchParams<{ patternId?: string }>()
  const id = params.patternId ? Number(params.patternId) : NaN

  const sqlite = useSQLiteContext()
  const setPatternReview = useAppStore.use.setPatternReview()

  const db = useMemo(() => drizzle(sqlite), [sqlite])

  const { data, updatedAt, error } = useLiveQuery(
    db
      .select({
        id: patterns.id,
        name: patterns.name,
        groupingTemplate: patterns.groupingPattern,
        template: patterns.extractionPattern,
        status: patterns.status,
      })
      .from(patterns)
      .where(eq(patterns.id, id))
  )
  const patternName = data?.[0]?.name || ''
  useEffect(() => {
    if (!patternName) return
    const samples = getPatternSamplesByName(patternName)
    setPatternReview(samples)
  }, [patternName, setPatternReview])

  if (error) {
    return (
      <View>
        <Text> Error loading pattern: {error.message} </Text>
      </View>
    )
  }

  if (!updatedAt) {
    return (
      <View>
        <Text> Loading... </Text>
      </View>
    )
  }

  if (!data || data?.length === 0) {
    return (
      <View>
        <Text> No pattern found </Text>
      </View>
    )
  }

  const row = data?.[0]
  return (
    <PatternReviewScreen
      id={Number(row.id)}
      name={row.name}
      groupingTemplate={row.groupingTemplate}
      template={row.template}
      status={row.status}
    />
  )
}
