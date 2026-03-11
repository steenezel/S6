import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Plus, ShoppingCart, Trash2, History } from 'lucide-react'
import {
  useAddShoppingItem,
  useShoppingList,
  useToggleShoppingItem,
  useDeleteShoppingItem,
  type ShoppingCategory,
} from '../../features/shopping/useShoppingList'
import { Card } from '../ui/card'

const CATEGORIES: { id: ShoppingCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Alles' },
  { id: 'supermarkt', label: 'Winkel' },
  { id: 'apotheek', label: 'Apotheek' },
  { id: 'bureaugerei', label: 'Bureau' },
]

export const ShoppingList = () => {
  const [filter, setFilter] = useState<ShoppingCategory | 'all'>('all')
  const [input, setInput] = useState('')
  const [category] = useState<ShoppingCategory>('supermarkt')

  const { data } = useShoppingList({ category: filter })
  const toggleMutation = useToggleShoppingItem()
  const addMutation = useAddShoppingItem()
  const deleteMutation = useDeleteShoppingItem()

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    addMutation.mutate({ title: input.trim(), category })
    setInput('')
  }

  const items = data ?? []
  const activeItems = items.filter((item: any) => !item.is_done)
  const completedItems = items.filter((item: any) => item.is_done)

  return (
    <Card className="bg-[#0B101D]/60 border-slate-700/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="p-6 pb-2 text-left">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Boodschappen</h2>
            <p className="text-[10px] text-emerald-500/70 font-black uppercase tracking-[0.2em]">Realtime Sync</p>
          </div>
        </div>
      </div>

      <div className="px-6 pt-2 pb-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id as ShoppingCategory | 'all')}
              className={`px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase transition-all ${
                filter === c.id ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 text-slate-400'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nodig..."
            className="flex-1 rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/40 outline-none"
          />
          <button type="submit" disabled={addMutation.isPending} className="bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl font-bold">
            <Plus className="h-5 w-5" />
          </button>
        </form>

        <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar text-left">
          {/* ACTIEVE ITEMS */}
          <ul className="space-y-2">
            <AnimatePresence mode="popLayout">
              {activeItems.map((item: any) => (
                <ShoppingRow key={item.id} item={item} onToggle={toggleMutation.mutate} onDelete={deleteMutation.mutate} />
              ))}
            </AnimatePresence>
          </ul>

          {/* GEKOCHTE ITEMS (Google Keep stijl) */}
          {completedItems.length > 0 && (
            <div className="pt-4 border-t border-slate-800/50">
              <div className="flex items-center gap-2 mb-3 text-slate-500">
                <History className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Gekocht</span>
              </div>
              <ul className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {completedItems.map((item: any) => (
                    <ShoppingRow key={item.id} item={item} onToggle={toggleMutation.mutate} onDelete={deleteMutation.mutate} isCompleted />
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

const ShoppingRow = ({ item, onToggle, onDelete, isCompleted = false }: any) => (
  <motion.li
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className={`group flex items-center gap-3 rounded-2xl border p-3 transition-all ${
      isCompleted ? 'bg-slate-900/30 border-slate-800/50 opacity-60' : 'bg-white border-slate-200 shadow-sm'
    }`}
  >
    <button
      onClick={() => onToggle({ id: item.id, isDone: !item.is_done })}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
        isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-200 text-transparent'
      }`}
    >
      <CheckSquare className="h-4 w-4" />
    </button>

    <span className={`flex-1 font-bold text-sm truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
      {item.title}
    </span>

    <div className="flex items-center gap-2">
      <span className="text-[9px] font-black uppercase tracking-tighter bg-slate-100 text-slate-500 px-2 py-1 rounded-md border border-slate-200">
        {item.category}
      </span>
      
      {/* HET VUILBAKJE */}
      <button
        onClick={() => onDelete({ id: item.id })}
        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  </motion.li>
)