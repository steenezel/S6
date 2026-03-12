import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Plus, ShoppingCart, Trash2, History } from 'lucide-react'
import {
  useAddShoppingItem,
  useShoppingList,
  useToggleShoppingItem,
  useDeleteShoppingItem,
} from '../../features/shopping/useShoppingList'
import { Card } from '../ui/card'

export const ShoppingList = () => {
  const [input, setInput] = useState('')

  const { data } = useShoppingList({ category: 'all' })
  const toggleMutation = useToggleShoppingItem()
  const addMutation = useAddShoppingItem()
  const deleteMutation = useDeleteShoppingItem()

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    addMutation.mutate({ title: input.trim(), category: 'supermarkt' })
    setInput('')
  }

  const items = data ?? []
  const activeItems = items.filter((item: any) => !item.is_done)
  const completedItems = items.filter((item: any) => item.is_done)

  return (
    <Card className="bg-[#0B101D] border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-full font-sans">
      {/* Header: Match met Treinplanner */}
      <div className="p-5 border-b border-slate-800/60 bg-slate-900/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <ShoppingCart className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Boodschappen</h2>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-tighter">
          {activeItems.length} items nodig
        </span>
      </div>

      <div className="p-4 space-y-4 flex-1 flex flex-col min-h-0">
        {/* Input: Strakker en donkerder */}
        <form onSubmit={handleAdd} className="flex gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800/40">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Item toevoegen..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
          />
          <button 
            type="submit" 
            disabled={addMutation.isPending} 
            className="bg-emerald-500 text-slate-950 px-4 rounded-xl font-bold hover:bg-emerald-400 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </form>

        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {/* ACTIEVE ITEMS: Geen kaarten, maar een strakke lijst */}
          <ul className="divide-y divide-slate-800/30">
            <AnimatePresence mode="popLayout">
              {activeItems.map((item: any) => (
                <ShoppingRow 
                  key={item.id} 
                  item={item} 
                  onToggle={toggleMutation.mutate} 
                  onDelete={deleteMutation.mutate} 
                />
              ))}
            </AnimatePresence>
          </ul>

          {/* GEKOCHTE ITEMS: Compactere weergave onderaan */}
          {completedItems.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2 px-2">
                <History className="h-3 w-3 text-slate-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Gekocht</span>
              </div>
              <ul className="divide-y divide-slate-800/20 opacity-60">
                <AnimatePresence mode="popLayout">
                  {completedItems.map((item: any) => (
                    <ShoppingRow 
                      key={item.id} 
                      item={item} 
                      onToggle={toggleMutation.mutate} 
                      onDelete={deleteMutation.mutate} 
                      isCompleted 
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          )}

          {activeItems.length === 0 && completedItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 text-xs font-medium uppercase tracking-widest italic">Lijst is leeg</p>
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
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, x: -10 }}
    className="group flex items-center gap-3 py-3 px-2 hover:bg-slate-800/40 transition-colors rounded-xl border-b border-slate-800/30 last:border-0 !bg-transparent"
  >
    {/* De Checkbox Container: h-5 w-5 geforceerd */}
    <div className="flex items-center justify-center h-5 w-5 shrink-0">
      <button
        onClick={() => onToggle({ id: item.id, isDone: !item.is_done })}
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-300 !shadow-none ${
          isCompleted 
            ? 'bg-emerald-500 border-emerald-500' 
            : 'bg-transparent border-slate-700 hover:border-emerald-500/50'
        }`}
      >
        <motion.div
          initial={false}
          animate={{ scale: isCompleted ? 1 : 0 }}
          className="text-slate-950 flex items-center justify-center"
        >
          <CheckSquare className="h-3 w-3 stroke-[3px]" />
        </motion.div>
      </button>
    </div>

    {/* Tekst: text-slate-200 voor contrast */}
    <span className={`flex-1 font-bold text-sm text-left truncate transition-colors duration-300 ${
      isCompleted ? 'line-through text-slate-600' : 'text-slate-200'
    }`}>
      {item.title}
    </span>

    {/* Vuilbakje */}
    <button
      onClick={() => onDelete({ id: item.id })}
      className="p-1.5 text-slate-700 hover:text-red-500 transition-colors md:opacity-0 md:group-hover:opacity-100 shrink-0"
      title="Verwijder item"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  </motion.li>
)