import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AlertTriangle, TrainFront, ArrowRight, Clock } from 'lucide-react'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

type IrailConnection = {
  id: string
  departureTime: string
  arrivalTime: string
  arrivalTimeRaw: number // Toevoegen voor sortering
  durationMinutes: number
  platform: string | null
  delayMinutes: number
  to: string
}

type RouteConfig = {
  id: string
  label: string
  from: string
  to: string
}

const ROUTES: RouteConfig[] = [
  { id: 'kt-gsp', label: 'Kortrijk → Gent-Sint-Pieters', from: 'Kortrijk', to: 'Gent-Sint-Pieters' },
  { id: 'gsp-kt', label: 'Gent-Sint-Pieters → Kortrijk', from: 'Gent-Sint-Pieters', to: 'Kortrijk' },
  { id: 'kt-gd', label: 'Kortrijk → Gent-Dampoort', from: 'Kortrijk', to: 'Gent-Dampoort' },
  { id: 'gd-kt', label: 'Gent-Dampoort → Kortrijk', from: 'Gent-Dampoort', to: 'Kortrijk' },
]

async function fetchIrailConnections(params: {
  from: string
  to: string
  date: string
  time: string
  timeSel: 'departure' | 'arrival'
}): Promise<IrailConnection[]> {
  const { from, to, date, time, timeSel } = params
  
  // Datum van YYYY-MM-DD naar DDMMYY
  const formattedDate = date.split('-').reverse().map(s => s.slice(-2)).join('')
  // Tijd van HH:MM naar HHMM
  const formattedTime = time.replace(':', '')

  const url = new URL('https://api.irail.be/connections')
  url.searchParams.set('from', from)
  url.searchParams.set('to', to)
  url.searchParams.set('date', formattedDate)
  url.searchParams.set('time', formattedTime)
  // iRail API parameters zijn 'depart' of 'arrive'
  url.searchParams.set('timesel', timeSel === 'departure' ? 'depart' : 'arrive')
  url.searchParams.set('format', 'json')
  url.searchParams.set('lang', 'nl')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`iRail request failed: ${res.status}`)

  const data = await res.json()
  const rawConnections = Array.isArray(data.connection) ? data.connection : []

  // Maak een Date object van de gevraagde tijd om mee te vergelijken
  const targetDate = new Date(`${date}T${time}:00`)
  const targetTimestamp = targetDate.getTime()

  const mapped = rawConnections.map((c: any, index: number) => {
    const depTime = Number(c.departure.time) * 1000
    const arrTime = Number(c.arrival.time) * 1000
    
    return {
      id: c.id ?? `conn-${index}`,
      departureTime: new Date(depTime).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }),
      arrivalTime: new Date(arrTime).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }),
      departureTimeRaw: depTime,
      arrivalTimeRaw: arrTime,
      durationMinutes: Math.round((arrTime - depTime) / 1000 / 60),
      platform: c.departure.platform ?? null,
      delayMinutes: Math.round((Number(c.departure.delay) || 0) / 60),
      to: c.departure.direction?.name ?? to,
    }
  })

  if (timeSel === 'arrival') {
    // FILTER: Alleen treinen die aankomen VÓÓR of OP het gekozen tijdstip
    // SORTERING: De trein die het dichtst bij het tijdstip aankomt bovenaan (laatste eerst)
    return mapped
      .filter((c: any) => c.arrivalTimeRaw <= targetTimestamp + 60000) // +1 min marge
      .sort((a: any, b: any) => b.arrivalTimeRaw - a.arrivalTimeRaw)
      .slice(0, 4)
  }

  // Bij vertrek: Gewoon chronologisch vanaf nu
  return mapped
    .sort((a: any, b: any) => a.departureTimeRaw - b.departureTimeRaw)
    .slice(0, 4)
}

export const TrainTracker = () => {
  const [activeRouteId, setActiveRouteId] = useState<string>('kt-gsp')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState(new Date().toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }))
  const [timeSel, setTimeSel] = useState<'departure' | 'arrival'>('departure')

  const activeRoute = ROUTES.find((route) => route.id === activeRouteId) ?? ROUTES[0]

  const { data: connections, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['irail', activeRoute.from, activeRoute.to, date, time, timeSel],
    queryFn: () => fetchIrailConnections({ from: activeRoute.from, to: activeRoute.to, date, time, timeSel }),
    // Refresh enkel als we "nu" (vertrek) bekijken
    refetchInterval: 60000, 
  })

  return (
    <Card className="bg-[#0B101D]/60 border-slate-700/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-full">
      <div className="p-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <TrainFront className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-white tracking-tight">NMBS Live</h2>
            <p className="text-[10px] text-cyan-500/70 font-black uppercase tracking-[0.2em]">Trajectplanner</p>
          </div>
        </div>
        <button onClick={() => refetch()} className="text-slate-400 hover:text-cyan-400 p-2">
          <Clock className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Route Selectie - Grote leesbare knoppen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ROUTES.map((route) => (
            <button
              key={route.id}
              onClick={() => setActiveRouteId(route.id)}
              className={`px-4 py-3 rounded-2xl border text-[11px] font-black uppercase tracking-tight transition-all text-left ${
                activeRouteId === route.id
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              {route.label}
            </button>
          ))}
        </div>

        {/* Selector Panel */}
        <div className="bg-slate-950/40 p-4 rounded-[1.5rem] border border-slate-800/50 space-y-3">
          <div className="flex gap-2">
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
            />
            <input 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)}
              className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button 
              onClick={() => setTimeSel('departure')}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${timeSel === 'departure' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500'}`}
            >
              Vertrek
            </button>
            <button 
              onClick={() => setTimeSel('arrival')}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${
                timeSel === 'arrival' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-500'
              }`}
            >
              Aankomst
            </button>
          </div>
        </div>

        {/* Resultaten */}
        <div className="space-y-3 text-left">
          {isLoading ? (
             <div className="space-y-3">
               {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl bg-slate-800/50" />)}
             </div>
          ) : isError ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Kon data niet ophalen.
            </div>
          ) : (
            connections?.map((conn: IrailConnection) => (
              <motion.div 
                key={conn.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-4 rounded-[1.5rem] flex items-center gap-4 shadow-sm border border-slate-200"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${conn.delayMinutes > 0 ? 'bg-red-50' : 'bg-cyan-50'}`}>
                  <TrainFront className={`h-5 w-5 ${conn.delayMinutes > 0 ? 'text-red-500' : 'text-cyan-600'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-black ${timeSel === 'departure' ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                      {conn.departureTime}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-300" />
                    <span className={`text-lg font-black ${timeSel === 'arrival' ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                      {conn.arrivalTime}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Richting {conn.to}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-slate-900">{conn.platform ? `P${conn.platform}` : '--'}</div>
                  {conn.delayMinutes > 0 && <div className="text-[10px] font-bold text-red-600">+{conn.delayMinutes}'</div>}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </Card>
  )
}