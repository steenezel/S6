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
    <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-xl">
      <div className="p-4 pb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
            <ShoppingCart className="h-4 w-4 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-semibold text-slate-50">
              Realtime boodschappenlijst
            </h2>
            <p className="text-xs text-slate-400">
              Supabase + realtime + PWA-friendly.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-1 pb-3 space-y-3">
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id as ShoppingCategory | 'all')}
              className={[
                'px-2 py-1 rounded-full border transition-colors',
                filter === c.id
                  ? 'border-emerald-400/80 bg-emerald-500/10 text-emerald-100'
                  : 'border-slate-700/70 bg-slate-900/70 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-100',
              ].join(' ')}
            >
              {c.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleAdd}
          className="flex items-center gap-2 mt-1 text-xs md:text-sm"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nieuw item toevoegen..."
            className="flex-1 rounded-xl border border-slate-700/70 bg-slate-950/70 px-3 py-2 text-xs md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400/70"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ShoppingCategory)}
            className="rounded-xl border border-slate-700/70 bg-slate-950/70 px-2 py-2 text-[11px] text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400/70"
          >
            <option value="supermarkt">Supermarkt</option>
            <option value="apotheek">Apotheek</option>
            <option value="bureaugerei">Bureaugerei</option>
          </select>
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 text-slate-950 px-3 py-2 text-xs font-medium hover:bg-emerald-400 disabled:opacity-60"
          >
            <Plus className="h-3 w-3" />
            Toevoegen
          </button>
        </form>

        {isLoading && (
          <div className="space-y-2 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/70 px-3 py-2"
              >
                <Skeleton className="h-4 w-4 rounded-md bg-slate-800/80" />
                <Skeleton className="h-3 w-32 bg-slate-800/80" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <div className="mt-2 rounded-xl border border-red-500/60 bg-red-950/40 px-3 py-2 text-[11px] text-red-100 flex items-center gap-2">
            <Trash2 className="h-3.5 w-3.5 text-red-300" />
            <span>Kon de boodschappenlijst niet laden. Probeer later opnieuw.</span>
          </div>
        )}

        {!isLoading && !isError && (
          <motion.ul
            className="mt-2 space-y-1.5 max-h-72 overflow-y-auto pr-1"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {items.length === 0 && (
              <li className="text-[11px] text-slate-500 px-1 py-1.5">
                Nog geen items. Voeg je eerste item toe ✨
              </li>
            )}
// Zoek in je code naar het map-gedeelte van de items en vervang het door dit blok:

{items.map((item: any) => {
  const isDone = item.is_done
  return (
    <li key={item.id}>
      <button
        type="button"
        onClick={() =>
          toggleMutation.mutate({ id: item.id, isDone: !isDone })
        }
        className={[
          'w-full flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-xs md:text-sm transition-all shadow-sm',
          // Verbeterde achtergrond: donkerder en duidelijker contrast
          'bg-slate-950/90 border-slate-800 hover:border-emerald-500/50',
          isDone ? 'opacity-40' : 'opacity-100',
        ].join(' ')}
      >
        <div
          className={[
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
            isDone
              ? 'bg-emerald-500 border-emerald-400 text-slate-950'
              : 'bg-slate-900 border-slate-700 text-slate-500',
          ].join(' ')}
        >
          <CheckSquare className="h-3.5 w-3.5" />
        </div>
        
        {/* De tekst van het item: geforceerd naar wit voor maximale leesbaarheid */}
        <span className={[
          'flex-1 truncate font-medium text-slate-50', // text-slate-50 is bijna wit
          isDone ? 'line-through text-slate-500' : ''
        ].join(' ')}>
          {item.title}
        </span>

        {/* Categorie-label: iets feller gemaakt */}
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80 bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10">
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

