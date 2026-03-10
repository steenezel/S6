import { useEffect } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export type ShoppingCategory = 'supermarkt' | 'apotheek' | 'bureaugerei'

export type ShoppingListItem = {
  id: string
  household_id: string | null
  title: string
  category: ShoppingCategory
  is_done: boolean
  created_at: string
  updated_at: string
}

const SHOPPING_LIST_KEY = ['shopping_list']

type UseShoppingListOptions = {
  category?: ShoppingCategory | 'all'
}

export const useShoppingList = (
  options: UseShoppingListOptions = {},
): UseQueryResult<ShoppingListItem[]> => {
  const { category = 'all' } = options
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: [...SHOPPING_LIST_KEY, { category }],
    queryFn: async () => {
      let queryBuilder = supabase
        .from('shopping_list')
        .select('*')
        .order('created_at', { ascending: true })

      if (category !== 'all') {
        queryBuilder = queryBuilder.eq('category', category)
      }

      const { data, error } = await queryBuilder
      if (error) {
        throw error
      }

      return (data ?? []) as ShoppingListItem[]
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel('shopping_list_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopping_list',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_KEY })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return query
}

type ToggleArgs = {
  id: string
  isDone: boolean
}

export const useToggleShoppingItem = (): UseMutationResult<
  void,
  unknown,
  ToggleArgs
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isDone }: ToggleArgs) => {
      const { error } = await supabase
        .from('shopping_list')
        .update({ is_done: isDone })
        .eq('id', id)

      if (error) {
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_KEY })
    },
  })
}

type AddItemArgs = {
  title: string
  category: ShoppingCategory
}

export const useAddShoppingItem = (): UseMutationResult<
  ShoppingListItem | null,
  unknown,
  AddItemArgs
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ title, category }: AddItemArgs) => {
      const { data, error } = await supabase
        .from('shopping_list')
        .insert({ title, category })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as ShoppingListItem | null
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_KEY })
    },
  })
}

