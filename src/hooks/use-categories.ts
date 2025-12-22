import { Category } from '@/db/schema'
import { getFavoriteCategories, setFavoriteCategories } from '@/services/database/categories-repository'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const FAVORITE_CATEGORIES_QUERY_KEY = ['favorite-categories'] as const

export function useGetFavoriteCategories() {
  return useQuery<Category[]>({
    queryKey: FAVORITE_CATEGORIES_QUERY_KEY,
    queryFn: getFavoriteCategories,
  })
}

export function useSetFavoriteCategories() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setFavoriteCategories,
    onSuccess: (data) => {
      queryClient.setQueryData(FAVORITE_CATEGORIES_QUERY_KEY, data)
    },
  })
}
