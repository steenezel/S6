import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Plus, MapPin, X, Loader2 } from 'lucide-react'
import { getCalendarEvents, addCalendarEvent } from '../../lib/calendar'
import { Card } from '../ui/card'

export const GoogleCalendarWidget = () => {
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isAdding, setIsAdding] = useState(false)
  
  const [summary, setSummary] = useState('')
  const [startTime, setStartTime] = useState('12:00')

  const { data: events, isFetching } = useQuery({
    queryKey: ['calendar-events', selectedDate],
    queryFn: () => getCalendarEvents(selectedDate),
    refetchInterval: 300000,
  })

  const addMutation = useMutation({
    mutationFn: async () => {
      const startDateTime = `${selectedDate}T${startTime}:00`
      const endHour = (parseInt(startTime.split(':')[0]) + 1).toString().padStart(2, '0')
      const endDateTime = `${selectedDate}T${endHour}:${startTime.split(':')[1]}:00`
      return addCalendarEvent(summary, startDateTime, endDateTime)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      setSummary('')
      setIsAdding(false)
    }
  })

  return (
    <Card className="bg-[#0B101D] border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-full">
      <div className="p-5 border-b border-slate-800/60 bg-slate-900/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 relative">
              <CalendarDays className="h-5 w-5 text-blue-400" />
              {isFetching && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              )}
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Agenda</h2>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`${isAdding ? 'bg-slate-800 text-white' : 'bg-blue-500 text-slate-950'} p-2 rounded-xl transition-all shadow-lg`}
          >
            {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-blue-500/20 space-y-3">
                <input 
                  autoFocus
                  placeholder="Wat plannen we?"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none" />
                  <button onClick={() => addMutation.mutate()} disabled={!summary || addMutation.isPending} className="bg-blue-500 text-slate-950 px-4 rounded-xl font-bold text-xs flex items-center gap-2">
                    {addMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Opslaan'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800/40">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-300 outline-none" />
          <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${selectedDate === new Date().toISOString().split('T')[0] ? 'bg-blue-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
            Vandaag
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 text-left">
        <div className="space-y-1">
          {events?.length === 0 ? (
            <p className="text-slate-600 text-xs italic text-center py-10 uppercase tracking-widest font-medium">Geen afspraken</p>
          ) : (
            events?.map((event: any) => (
              <div key={event.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-800/30 transition-colors border-b border-slate-800/30 last:border-0">
                <div className="text-right min-w-[50px] pt-0.5 leading-tight font-black text-white text-sm">
                  {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }) : 'DAG'}
                </div>
                {/* De verticale lijn krijgt nu een vaste hoogte of stretch, we gebruiken h-5 voor een subtiel lijntje bij wrappen */}
                <div className="w-1 h-5 mt-1 rounded-full bg-blue-500/30 shrink-0" />
                
                <div className="flex-1 min-w-0">
                  {/* Truncate verwijderd, normal-case toegevoegd voor betere wrap-leesbaarheid */}
                  <div className="text-sm font-bold text-slate-200 leading-snug break-words">
                    {event.summary}
                  </div>
                  {event.location && (
                    <div className="flex items-start gap-1 text-[9px] text-slate-500 font-bold uppercase mt-1 leading-tight">
                      <MapPin className="h-2 w-2 mt-0.5 shrink-0" /> 
                      <span className="break-words">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  )
}