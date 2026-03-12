import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Plus, MapPin, ChevronRight } from 'lucide-react'
import { getCalendarEvents } from '../../lib/calendar' // Zorg dat dit pad klopt
import { Card } from '../ui/card'

export const GoogleCalendarWidget = () => {
  // Datum-state om te kunnen navigeren
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const { data: events, isFetching } = useQuery({
    queryKey: ['calendar-events', selectedDate],
    queryFn: () => getCalendarEvents(selectedDate),
    refetchInterval: 300000, // Elke 5 minuten verversen
  })

  return (
    <Card className="bg-[#0B101D] border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-full font-sans">
      {/* Header met navigatie */}
      <div className="p-5 border-b border-slate-800/60 bg-slate-900/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
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
          <button className="bg-blue-500 p-2 rounded-xl text-slate-950 hover:bg-blue-400 transition-colors">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Datum Selector */}
        <div className="flex gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800/40">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-300 outline-none"
          />
          <button 
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
              selectedDate === new Date().toISOString().split('T')[0]
                ? 'bg-blue-500 text-slate-950'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            Vandaag
          </button>
        </div>
      </div>

      {/* Events Lijst */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar text-left">
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {events?.length === 0 ? (
              <p className="text-slate-600 text-xs italic text-center py-10 uppercase tracking-widest font-medium">Geen afspraken</p>
            ) : (
              events?.map((event: any) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/30 transition-colors border-b border-slate-800/30 last:border-0"
                >
                  <div className="text-right min-w-[50px] leading-tight">
                    <div className="text-sm font-black text-white">
                      {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }) : 'DAG'}
                    </div>
                    <div className="text-[9px] font-bold text-slate-600 uppercase">
                      {event.end?.dateTime ? new Date(event.end.dateTime).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }) : 'Hele dag'}
                    </div>
                  </div>
                  
                  <div className="w-1 h-8 rounded-full bg-blue-500/30 group-hover:bg-blue-500 transition-colors" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-200 truncate">{event.summary}</div>
                    {event.location && (
                      <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase tracking-tight mt-0.5">
                        <MapPin className="h-2 w-2" /> {event.location}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-800 group-hover:text-slate-600" />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  )
}