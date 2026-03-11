import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export type ShoppingCategory = 'supermarkt' | 'apotheek' | 'bureaugerei'

export const useShoppingList = (options: { category: ShoppingCategory | 'all' }) => {
  return useQuery({
    queryKey: ['shopping-list', options.category],
    queryFn: async () => {
      let query = supabase
        .from('shopping_list')
        .select('*')
        .order('is_done', { ascending: true })
        .order('created_at', { ascending: false })

      if (options.category !== 'all') {
        query = query.eq('category', options.category)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export const useAddShoppingItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (item: { title: string; category: ShoppingCategory }) => {
      const { data, error } = await supabase.from('shopping_list').insert([item]).select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] })
    },
  })
}

export const useToggleShoppingItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isDone }: { id: string; isDone: boolean }) => {
      const { data, error } = await supabase
        .from('shopping_list')
        .update({ is_done: isDone })
        .eq('id', id)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] })
    },
  })
}

// NIEUW: De delete functie
export const useDeleteShoppingItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] })
    },
  })
}