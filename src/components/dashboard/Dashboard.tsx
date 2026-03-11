import React from 'react'
import { motion } from 'framer-motion'
import { 
  CalendarDays, 
  ShoppingBasket, 
  BarChart3, 
  TrainFront, 
  LogOut, 
  Sparkles,
  LayoutDashboard
} from 'lucide-react'
import { TrainTracker } from './TrainTracker'
import { ShoppingList } from './ShoppingList'
import { GoogleCalendarWidget } from './GoogleCalendarWidget'
import { Card } from '../ui/card'
import { supabase } from '../../lib/supabase'

type DashboardProps = {
  familyName?: string
  userName?: string
}

export const Dashboard = ({ 
  familyName = 'S6.Hub', 
  userName = 'Pieter Jan' 
}: DashboardProps) => {
  
  const handleSignOut = async () => {
    await (supabase as any).auth.signOut();
  }

  return (
    <div className="min-h-screen bg-[#06080F] text-slate-50 flex font-sans antialiased overflow-x-hidden relative">
      {/* Subtiele achtergrond-gloed voor diepte */}
      <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] bg-sky-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar - Nu correct hersteld voor desktop */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-slate-800/40 bg-[#0B101D]/40 backdrop-blur-2xl z-30">
        <div className="px-8 py-8 flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/70">
              S6 GEZIN
            </span>
            <span className="text-lg font-bold tracking-tight text-white">{familyName}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Overzicht" active />
          <SidebarItem icon={CalendarDays} label="Gezinsagenda" />
          <SidebarItem icon={ShoppingBasket} label="Boodschappen" />
          <SidebarItem icon={BarChart3} label="Family Polls" />
          <SidebarItem icon={TrainFront} label="Trein Tracker" />
        </nav>

        <div className="p-6 mt-auto">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Sessie beëindigen</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Header met persoonlijke begroeting */}
        <header className="sticky top-0 z-20 border-b border-slate-800/40 bg-[#06080F]/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mb-1">
                WELKOM THUIS
              </span>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Goeiemorgen, <span className="text-emerald-400">{userName}</span> ✨
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Systeem Status</span>
                <span className="text-xs font-medium text-emerald-400">Live & Synchronized</span>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-emerald-500/20 p-0.5">
                <div className="h-full w-full rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-10 py-8 md:py-12">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Linker kolom: Agenda & Polls */}
            <div className="xl:col-span-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <GoogleCalendarWidget />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="h-full bg-[#0B101D]/60 border-slate-700/50 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl group transition-all hover:border-violet-500/30">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                        <BarChart3 className="h-6 w-6 text-violet-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Family Poll</h2>
                        <p className="text-sm text-slate-400">Stem op de weekplanning</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center h-40 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/30">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Module Coming Soon</p>
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* Boodschappenlijst Sectie */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <ShoppingList />
              </motion.section>
            </div>

            {/* Rechter kolom: Treinen & Informatie */}
            <div className="xl:col-span-4 space-y-8">
              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <TrainTracker />
              </motion.section>
              
              <Card className="bg-emerald-500/5 border-emerald-500/20 backdrop-blur-xl rounded-[2.5rem] p-8 border-dashed flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">Weekend Status</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Vergeet niet je aanwezigheid voor het weekend te bevestigen in de gezinsagenda! 🏠
                </p>
              </Card>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

// Hulpcomponent voor de sidebar items
type SidebarItemProps = {
  icon: any
  label: string
  active?: boolean
}

const SidebarItem = ({ icon: Icon, label, active }: SidebarItemProps) => {
  return (
    <button
      type="button"
      className={`w-full flex items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-all group ${
        active
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5'
          : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100 border border-transparent'
      }`}
    >
      <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
      <span className="text-sm font-semibold tracking-tight">{label}</span>
    </button>
  )
}