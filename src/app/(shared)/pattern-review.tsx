import { Text } from '@/components/ui/text'
import { patterns } from '@/db/schema'
import { PatternReviewScreen } from '@/screens/pattern-review/pattern-review-screen'
import { eq } from 'drizzle-orm'
import { drizzle, useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useMemo } from 'react'
import { View } from 'react-native'

export default function PatternReviewRoute() {
  const params = useLocalSearchParams<{ patternId?: string }>()
  const id = params.patternId ? Number(params.patternId) : NaN

  const sqlite = useSQLiteContext()
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
