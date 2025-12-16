import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useRef } from 'react'

/**
 * Refetches data when screen comes into focus.
 * Skips the first mount to avoid double-fetching (per TanStack Query docs).
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/react-native#refresh-on-screen-focus
 */
export function useRefetchOnFocus(refetch: () => void) {
  const firstTimeRef = useRef(true)

  useFocusEffect(
    useCallback(() => {
      console.log('Focus effect triggered for refetching')
      if (firstTimeRef.current) {
        firstTimeRef.current = false
        return
      }

      // refetch all stale active queries
      refetch()
    }, [refetch])
  )
}
