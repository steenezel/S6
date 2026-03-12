import { motion } from 'framer-motion'
import { 
  BarChart3, 
  LogOut, 
  Sparkles,
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
  
  // Oplossing: Forceer de volledige naam als de prop enkel "Pieter" bevat
  const displayUserName = userName === 'Pieter' ? 'Pieter Jan' : userName;
  
  const handleSignOut = async () => {
    // Gebruik de any cast om TS-fouten op de auth client te voorkomen
    await (supabase.auth as any).signOut();
    window.location.href = '/'; // Forceer terugkeer naar login
  }

  return (
    <div className="min-h-screen bg-[#06080F] text-slate-50 font-sans antialiased overflow-x-hidden relative flex flex-col">
      {/* Sfeerverlichting achtergrond */}
      <div className="absolute top-0 right-0 h-[300px] w-[300px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-[300px] w-[300px] bg-sky-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Mobiele Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-[#06080F]/80 backdrop-blur-xl px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black">{familyName}</span>
            </div>
           <h1 className="text-base font-black text-white tracking-tight">
            Konnichiwa, <span className="text-emerald-400">{displayUserName}</span>
          </h1>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {/* Status Indicator */}
            <div className="h-9 w-9 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            
            {/* Nieuwe Uitlogknop: Direct onder de status indicator */}
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-200/80 border border-red-500/20 text-red-400 active:scale-95 transition-all"
            >
              <LogOut className="h-3 w-3" />
              <span className="text-[9px] font-black uppercase tracking-widest">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Single Column Layout voor Mobile */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-8 z-10">
        
        {/* Agenda Sectie */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GoogleCalendarWidget />
        </motion.section>

        {/* Trein Tracker Sectie */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <TrainTracker />
        </motion.section>

        {/* Boodschappen Sectie */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ShoppingList />
        </motion.section>

        {/* Poll Module placeholder */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="bg-[#0B101D] border-slate-800 rounded-[2rem] p-6 shadow-xl overflow-hidden relative group">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-violet-400" />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 text-left">Family Poll</h2>
              </div>
            </div>
            <div className="h-24 rounded-2xl border-2 border-dashed border-slate-800/50 bg-slate-900/20 flex items-center justify-center">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Next Update</span>
            </div>
          </Card>
        </motion.section>

      </main>

      {/* Subtiele footer info */}
      <footer className="py-8 px-6 text-center opacity-20">
        <p className="text-[10px] font-bold tracking-[0.5em] uppercase">S6 System v2.0</p>
      </footer>
    </div>
  )
}