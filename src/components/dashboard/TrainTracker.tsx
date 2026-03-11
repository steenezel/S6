import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrainFront, ArrowRight, Clock, CalendarDays, ChevronRight } from 'lucide-react'
import { Card } from '../ui/card'

type IrailConnection = {
  id: string
  departureTime: string
  arrivalTime: string
  durationMinutes: number
  platform: string | null
  delayMinutes: number
  to: string
}

const ROUTES = [
  { id: 'kt-gsp', from: 'Kortrijk', to: 'Gent-Sint-Pieters', label: 'Kortrijk → Gent-SP' },
  { id: 'gsp-kt', from: 'Gent-Sint-Pieters', to: 'Kortrijk', label: 'Gent-SP → Kortrijk' },
  { id: 'kt-gd', from: 'Kortrijk', to: 'Gent-Dampoort', label: 'Kortrijk → Gent-Damp' },
  { id: 'gd-kt', from: 'Gent-Dampoort', to: 'Kortrijk', label: 'Gent-Damp → Kortrijk' },
]

async function fetchConnections(from: string, to: string, date: string, time: string): Promise<IrailConnection[]> {
  const formattedDate = date.split('-').reverse().map(s => s.slice(-2)).join('')
  const formattedTime = time.replace(':', '')
  
  const url = `https://api.irail.be/connections?from=${from}&to=${to}&date=${formattedDate}&time=${formattedTime}&timesel=depart&format=json&lang=nl`
  const res = await fetch(url)
  const data = await res.json()
  
  return (data.connection || []).slice(0, 5).map((c: any, i: number) => ({
    id: c.id ?? `c-${i}`,
    departureTime: new Date(Number(c.departure.time) * 1000).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }),
    arrivalTime: new Date(Number(c.arrival.time) * 1000).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }),
    durationMinutes: Math.round(Number(c.duration) / 60),
    platform: c.departure.platform || null,
    delayMinutes: Math.round(Number(c.departure.delay) / 60),
    to: c.departure.direction?.name || to
  }))
}

export const TrainTracker = () => {
  const [activeId, setActiveId] = useState('kt-gsp')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState(new Date().toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }))
  
  const route = ROUTES.find(r => r.id === activeId) || ROUTES[0]
  const { data, isFetching } = useQuery({
    queryKey: ['trains', activeId, date, time],
    queryFn: () => fetchConnections(route.from, route.to, date, time),
    refetchInterval: 60000
  })

  return (
    <Card className="bg-[#0B101D] border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-full font-sans">
      {/* Header: Compact & Dark */}
      <div className="p-5 border-b border-slate-800/60 bg-slate-900/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <TrainFront className="h-5 w-5 text-cyan-400" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">NMBS Realtime</h2>
        </div>
        <div className={`h-2 w-2 rounded-full ${isFetching ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`} />
      </div>

      {/* Selectors: High Density */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-1.5">
          {ROUTES.map(r => (
            <button
              key={r.id}
              onClick={() => setActiveId(r.id)}
              className={`py-2 px-3 text-[10px] font-bold uppercase rounded-xl border transition-all ${
                activeId === r.id ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 bg-slate-950/50 p-2 rounded-2xl border border-slate-800/40">
          <div className="flex-1 flex items-center gap-2 px-2">
            <CalendarDays className="h-3 w-3 text-slate-500" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent text-xs text-slate-300 outline-none w-full" />
          </div>
          <div className="w-px h-4 bg-slate-800 self-center" />
          <div className="flex-1 flex items-center gap-2 px-2">
            <Clock className="h-3 w-3 text-slate-500" />
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="bg-transparent text-xs text-slate-300 outline-none w-full" />
          </div>
        </div>
      </div>

      {/* Results: Professional List View */}
      <div className="flex-1 px-4 pb-6 overflow-y-auto">
        <div className="space-y-1">
          {data?.map((conn: IrailConnection) => (
            <motion.div
              key={conn.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/30 transition-colors border-b border-slate-800/30 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="text-left leading-none">
                  <div className="text-lg font-black text-white">{conn.departureTime}</div>
                  <div className={`text-[10px] font-bold mt-1 ${conn.delayMinutes > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {conn.delayMinutes > 0 ? `+${conn.delayMinutes}′` : 'ON TIME'}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-700" />
                <div className="text-left leading-none">
                  <div className="text-sm font-bold text-slate-400">{conn.arrivalTime}</div>
                  <div className="text-[9px] text-slate-600 mt-1 uppercase font-bold tracking-tighter">
                    Platform {conn.platform || '--'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Richting</div>
                <div className="text-xs font-bold text-cyan-400/80 truncate max-w-[80px]">{conn.to}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  )
}