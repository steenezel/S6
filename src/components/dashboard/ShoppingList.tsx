import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import {
  useAddShoppingItem,
  useShoppingList,
  useToggleShoppingItem,
  type ShoppingCategory,
} from '../../features/shopping/useShoppingList'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

const CATEGORIES: { id: ShoppingCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Alles' },
  { id: 'supermarkt', label: 'Supermarkt' },
  { id: 'apotheek', label: 'Apotheek' },
  { id: 'bureaugerei', label: 'Bureaugerei' },
]

export const ShoppingList = () => {
  const [filter, setFilter] = useState<ShoppingCategory | 'all'>('all')
  const [input, setInput] = useState('')
  const [category, setCategory] = useState<ShoppingCategory>('supermarkt')

  const { data, isLoading, isError } = useShoppingList({ category: filter })
  const toggleMutation = useToggleShoppingItem()
  const addMutation = useAddShoppingItem()

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    addMutation.mutate({ title: input.trim(), category })
    setInput('')
  }

  const items = data ?? []

  return (
    <Card className="bg-[#0B101D]/60 border-slate-700/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
      {/* Header sectie */}
      <div className="p-6 pb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg">
            <ShoppingCart className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Boodschappen
            </h2>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
              Realtime lijst
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pt-2 pb-6 space-y-4">
        {/* Categorie Filters */}
        <div className="flex flex-wrap gap-2 text-[11px]">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id as ShoppingCategory | 'all')}
              className={[
                'px-3 py-1.5 rounded-full border transition-all font-bold uppercase tracking-wider',
                filter === c.id
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10'
                  : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-500 hover:text-slate-200',
              ].join(' ')}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Toevoeg Formulier */}
        <form
          onSubmit={handleAdd}
          className="flex flex-col sm:flex-row items-center gap-3 mt-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Wat hebben we nodig?"
            className="w-full flex-1 rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
          />
          <div className="flex w-full sm:w-auto gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ShoppingCategory)}
              className="flex-1 sm:flex-none rounded-2xl border border-slate-700 bg-slate-900/50 px-3 py-3 text-xs font-bold text-emerald-400 focus:outline-none"
            >
              <option value="supermarkt">Winkel</option>
              <option value="apotheek">Apotheek</option>
              <option value="bureaugerei">Bureau</option>
            </select>
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Zet op lijst</span>
            </button>
          </div>
        </form>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3 mt-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-4">
                <Skeleton className="h-5 w-5 rounded-lg bg-slate-800" />
                <Skeleton className="h-4 w-40 bg-slate-800" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="mt-4 rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-red-400" />
            <span>Fout bij laden van de lijst.</span>
          </div>
        )}

        {/* De Eigenlijke Lijst */}
        {!isLoading && !isError && (
          <motion.ul
            className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {items.length === 0 && (
              <li className="text-center py-10 text-slate-500 italic text-sm">
                De koelkast is vol! Geen boodschappen nodig ✨
              </li>
            )}
            
            {items.map((item: any) => {
              const isDone = item.is_done
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggleMutation.mutate({ id: item.id, isDone: !isDone })}
                    className={[
                      'w-full flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all shadow-sm',
                      // We gebruiken hier een lichte achtergrond voor de items om de tekst zwart te kunnen maken (leesbaarheid)
                      'bg-white border-slate-200 hover:border-emerald-400 active:scale-[0.98]',
                      isDone ? 'opacity-40' : 'opacity-100',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all',
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-slate-50 border-slate-200 text-transparent',
                      ].join(' ')}
                    >
                      <CheckSquare className="h-4 w-4" />
                    </div>
                    
                    <span className={[
                      'flex-1 truncate font-bold text-slate-900 text-base', // Zwarte dikke tekst
                      isDone ? 'line-through text-slate-400' : ''
                    ].join(' ')}>
                      {item.title}
                    </span>

                    <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded-lg border border-slate-200">
                      {item.category}
                    </span>
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </div>
    </Card>
  )
}