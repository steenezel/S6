import { motion } from 'framer-motion'
import {
  House,
  CalendarDays,
  ShoppingBasket,
  BarChart3,
  TrainFront,
} from 'lucide-react'
import { TrainTracker } from './TrainTracker'
import { Card } from '../ui/card'
import { Separator } from '../ui/separator'

type DashboardProps = {
  familyName?: string
}

export const Dashboard = ({ familyName = 'Family Hub' }: DashboardProps) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800/60 bg-slate-950/60 backdrop-blur-xl">
        <div className="px-6 py-5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
            <House className="h-5 w-5 text-sky-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              FAM APP
            </span>
            <span className="text-sm font-medium text-slate-100">{familyName}</span>
          </div>
        </div>

        <Separator className="bg-slate-800/70" />

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <SidebarItem icon={CalendarDays} label="Agenda" active />
          <SidebarItem icon={ShoppingBasket} label="Boodschappen" />
          <SidebarItem icon={BarChart3} label="Polls" />
          <SidebarItem icon={TrainFront} label="Treinen" />
        </nav>

        <div className="px-4 py-4 border-t border-slate-800/60 text-xs text-slate-500">
          Gebouwd voor 6 personen • PWA ready
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Today&apos;s vibe
              </span>
              <h1 className="text-lg md:text-xl font-semibold text-slate-50">
                Central hub voor je gezin
              </h1>
            </div>
            <div className="flex items-center gap-3 text-xs md:text-sm text-slate-400">
              <span className="hidden sm:inline">Status:</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Realtime online
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-6 md:py-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-4 md:space-y-6 xl:col-span-2">
              <motion.section
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-xl">
                  <div className="p-4 pb-2">
                    <h2 className="flex items-center gap-2 text-base md:text-lg font-semibold">
                      <CalendarDays className="h-4 w-4 text-sky-300" />
                      Eerstvolgende afspraken
                    </h2>
                  </div>
                  <div className="p-4 pt-0 text-sm text-slate-400 space-y-3">
                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 text-xs text-slate-500">
                      Google Calendar widget komt hier (mock data / API-ready).
                    </div>
                  </div>
                </Card>

                <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-xl">
                  <div className="p-4 pb-2">
                    <h2 className="flex items-center gap-2 text-base md:text-lg font-semibold">
                      <BarChart3 className="h-4 w-4 text-violet-300" />
                      Family poll
                    </h2>
                  </div>
                  <div className="p-4 pt-0 text-sm text-slate-400 space-y-3">
                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 text-xs text-slate-500">
                      Poll module komt hier (Framer Motion progress bars).
                    </div>
                  </div>
                </Card>
              </motion.section>

              <motion.section
                className="space-y-4 md:space-y-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-xl">
                  <div className="p-4 pb-2">
                    <h2 className="flex items-center gap-2 text-base md:text-lg font-semibold">
                      <ShoppingBasket className="h-4 w-4 text-emerald-300" />
                      Realtime boodschappenlijst
                    </h2>
                  </div>
                  <div className="p-4 pt-0 space-y-3 text-sm text-slate-400">
                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 text-xs text-slate-500">
                      Supabase-gekoppelde boodschappenlijst komt hier (met PWA/offline).
                    </div>
                  </div>
                </Card>
              </motion.section>
            </div>

            <motion.section
              className="space-y-4 md:space-y-6"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.07 }}
            >
              <TrainTracker />
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  )
}

type SidebarItemProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  active?: boolean
}

const SidebarItem = ({ icon: Icon, label, active }: SidebarItemProps) => {
  return (
    <button
      type="button"
      className={[
        'w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors',
        active
          ? 'bg-slate-800/90 text-slate-50'
          : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-100',
      ].join(' ')}
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900/80 border border-slate-700/70">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-xs font-medium tracking-wide">{label}</span>
    </button>
  )
}

