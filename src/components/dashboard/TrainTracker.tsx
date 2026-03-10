import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AlertTriangle, TrainFront, ArrowRight } from 'lucide-react'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

type IrailConnection = {
  id: string
  departureTime: string
  arrivalTime: string
  durationMinutes: number
  platform: string | null
  delayMinutes: number
  to: string
}

type IrailApiConnection = {
  id: string
  departure: {
    time: string
    delay: number
    platform?: string
    direction?: { name: string }
  }
  arrival: {
    time: string
  }
  duration: string
}

type IrailApiResponse = {
  connection: IrailApiConnection[]
}

type RouteConfig = {
  id: string
  label: string
  from: string
  to: string
}

const ROUTES: RouteConfig[] = [
  {
    id: 'kt-gsp',
    label: 'Kortrijk → Gent-Sint-Pieters',
    from: 'Kortrijk',
    to: 'Gent-Sint-Pieters',
  },
  {
    id: 'gsp-kt',
    label: 'Gent-Sint-Pieters → Kortrijk',
    from: 'Gent-Sint-Pieters',
    to: 'Kortrijk',
  },
  {
    id: 'kt-gd',
    label: 'Kortrijk → Gent-Dampoort',
    from: 'Kortrijk',
    to: 'Gent-Dampoort',
  },
  {
    id: 'gd-kt',
    label: 'Gent-Dampoort → Kortrijk',
    from: 'Gent-Dampoort',
    to: 'Kortrijk',
  },
]

async function fetchIrailConnections(params: {
  from: string
  to: string
}): Promise<IrailConnection[]> {
  const { from, to } = params
  const url = new URL('https://api.irail.be/connections')
  url.searchParams.set('from', from)
  url.searchParams.set('to', to)
  url.searchParams.set('format', 'json')
  url.searchParams.set('lang', 'nl')
  url.searchParams.set('fast', 'true')

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`iRail request failed: ${res.status}`)
  }

  const data = (await res.json()) as IrailApiResponse
  const rawConnections = Array.isArray(data.connection) ? data.connection : []

  const normalized = rawConnections.slice(0, 3).map((c, index) => {
    const departure = new Date(Number(c.departure.time) * 1000)
    const arrival = new Date(Number(c.arrival.time) * 1000)

    const durationMinutes = Math.round(
      (arrival.getTime() - departure.getTime()) / 1000 / 60,
    )

    const delayMinutes = Math.round((Number(c.departure.delay) || 0) / 60)
    const toName = c.departure.direction?.name ?? to

    return {
      id: c.id ?? `conn-${index}`,
      departureTime: departure.toLocaleTimeString('nl-BE', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      arrivalTime: arrival.toLocaleTimeString('nl-BE', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      durationMinutes,
      platform: c.departure.platform ?? null,
      delayMinutes,
      to: toName,
    } satisfies IrailConnection
  })

  return normalized
}

export const TrainTracker = () => {
  const [activeRouteId, setActiveRouteId] = useState<string>('kt-gsp')
  const activeRoute =
    ROUTES.find((route) => route.id === activeRouteId) ?? ROUTES[0]

  const {
    data: connections,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['irail', activeRoute.from, activeRoute.to],
    queryFn: () => fetchIrailConnections({ from: activeRoute.from, to: activeRoute.to }),
    refetchInterval: 60_000,
  })

  const showSkeleton = isLoading || !connections

  return (
    <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-xl h-full flex flex-col">
      <div className="p-4 pb-2 flex items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-base md:text-lg font-semibold">
            <TrainFront className="h-4 w-4 text-cyan-300" />
            NMBS / iRail live
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            Kies een traject om de volgende treinen te zien.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1 text-[10px] text-slate-300 hover:border-cyan-400/70 hover:text-cyan-200 transition-colors"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/90 animate-pulse" />
          {isFetching ? 'Refresh...' : 'Refresh'}
        </button>
      </div>

      <div className="px-4 pt-1 pb-2">
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {ROUTES.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => setActiveRouteId(route.id)}
              className={[
                'rounded-full border px-2 py-1 text-[10px] text-left transition-colors',
                activeRouteId === route.id
                  ? 'bg-cyan-500/15 border-cyan-400/80 text-cyan-100'
                  : 'bg-slate-900/70 border-slate-700/80 text-slate-300 hover:border-cyan-400/60 hover:text-cyan-100',
              ].join(' ')}
            >
              {route.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 px-4 pb-3 pt-0">
        {showSkeleton && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-3 flex items-center gap-3"
              >
                <Skeleton className="h-10 w-10 rounded-2xl bg-slate-800/70" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24 bg-slate-800/70" />
                  <Skeleton className="h-3 w-32 bg-slate-800/70" />
                </div>
                <Skeleton className="h-3 w-10 bg-slate-800/70" />
              </div>
            ))}
          </div>
        )}

        {!showSkeleton && isError && (
          <div className="rounded-xl border border-red-500/50 bg-red-950/40 px-3 py-3 text-xs text-red-200 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-red-300" />
            <div className="space-y-1">
              <div className="font-medium">Kon iRail data niet laden</div>
              <p className="text-[11px] text-red-200/80">
                Check je internetverbinding of probeer het later opnieuw.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-1 inline-flex items-center gap-1 rounded-full border border-red-400/60 px-2 py-0.5 text-[10px] hover:bg-red-500/10"
              >
                Opnieuw proberen
              </button>
            </div>
          </div>
        )}

        {!showSkeleton && connections && !isError && (
          <motion.ul
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.06, duration: 0.25 },
              },
            }}
          >
            {connections.map((conn) => {
              const isDelayed = conn.delayMinutes > 0
              return (
                <motion.li
                  key={conn.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className={[
                    'rounded-2xl border px-3 py-3 flex items-center gap-3 text-xs md:text-sm',
                    'bg-slate-950/60 border-slate-800/80',
                    isDelayed ? 'shadow-[0_0_0_1px_rgba(248,113,113,0.3)]' : '',
                  ].join(' ')}
                >
                  <div className="h-10 w-10 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center">
                    <TrainFront
                      className={[
                        'h-5 w-5',
                        isDelayed ? 'text-red-300' : 'text-cyan-300',
                      ].join(' ')}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-medium text-slate-50">
                        <span>{conn.departureTime}</span>
                        <ArrowRight className="h-3 w-3 text-slate-500" />
                        <span className="text-slate-300">{conn.arrivalTime}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        ± {conn.durationMinutes} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[110px]">
                          Richting {conn.to}
                        </span>
                        {conn.platform && (
                          <span className="inline-flex items-center rounded-full bg-slate-900/80 border border-slate-700/80 px-2 py-0.5 text-[10px] text-slate-200">
                            Perron {conn.platform}
                          </span>
                        )}
                      </div>
                      {isDelayed ? (
                        <div className="inline-flex items-center gap-1 rounded-full bg-red-900/40 border border-red-500/60 px-2 py-0.5 text-[10px] text-red-100">
                          <AlertTriangle className="h-3 w-3 text-red-300" />
                          +{conn.delayMinutes} min
                        </div>
                      ) : (
                        <span className="text-[10px] text-emerald-300">
                          Op tijd
                        </span>
                      )}
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </motion.ul>
        )}
      </div>

      <div className="px-4 pb-3 pt-1 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Data via iRail API (NMBS)</span>
        <span className="text-slate-600">Auto-refresh elke 60s · Beta</span>
      </div>
    </Card>
  )
}

