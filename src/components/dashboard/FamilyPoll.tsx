import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Plus, Send, X, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Card } from '../ui/card'

export const FamilyPoll = () => {
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [activePoll, setActivePoll] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])

  useEffect(() => {
    fetchUserAndPoll()
  }, [])

  const fetchUserAndPoll = async () => {
    setLoading(true)
    const { data: { user } } = await (supabase.auth as any).getSession()
    if (user) setUserId(user.id)

    const { data } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options (*, poll_votes (user_id))
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (data) setActivePoll(data)
    setLoading(false)
  }

  const handleCreatePoll = async () => {
    if (!question || options.some(o => !o)) return

    const { data: poll } = await supabase
      .from('polls')
      .insert({ question })
      .select()
      .single()

    if (poll) {
      const optionsToInsert = options.map(opt => ({ poll_id: poll.id, option_text: opt }))
      await supabase.from('poll_options').insert(optionsToInsert)
      
      setIsCreating(false)
      setQuestion('')
      setOptions(['', ''])
      fetchUserAndPoll()
    }
  }

  const handleToggleVote = async (optionId: string, hasVoted: boolean) => {
    if (!userId) return

    if (hasVoted) {
      // Reeds gestemd op deze specifieke optie? Verwijder de stem (unvote)
      await supabase
        .from('poll_votes')
        .delete()
        .eq('option_id', optionId)
        .eq('user_id', userId)
    } else {
      // Nog niet gestemd op deze optie? Voeg stem toe
      await supabase
        .from('poll_votes')
        .insert({ option_id: optionId, user_id: userId })
    }
    fetchUserAndPoll()
  }

  const getTotalUniqueVoters = () => {
    if (!activePoll) return 0
    const allUserIds = activePoll.poll_options.flatMap((opt: any) => 
      opt.poll_votes.map((v: any) => v.user_id)
    )
    return new Set(allUserIds).size // Unieke personen die meededen
  }

  if (loading) return <div className="p-10 text-center opacity-20 uppercase tracking-widest text-xs font-black">Poll laden...</div>

  return (
    <Card className="bg-[#0B101D] border-slate-800 rounded-[2rem] p-6 shadow-xl overflow-hidden relative group font-sans">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 text-left">
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Family Poll</h2>
            {activePoll && !isCreating && (
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                {getTotalUniqueVoters()} personen hebben gestemd
              </p>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
        >
          {isCreating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isCreating ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <input 
              placeholder="Wat is de vraag?"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input 
                    placeholder={`Optie ${i + 1}`}
                    className="flex-1 bg-slate-900/30 border border-slate-800/50 rounded-xl px-4 py-2 text-xs text-slate-300 outline-none"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[i] = e.target.value;
                      setOptions(newOpts);
                    }}
                  />
                </div>
              ))}
              <button 
                onClick={() => setOptions([...options, ''])}
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-violet-400 px-2 pt-1"
              >
                + Optie toevoegen
              </button>
            </div>
            <button 
              onClick={handleCreatePoll}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-widest py-3 rounded-2xl transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20"
            >
              <Send className="h-3 w-3" /> Poll Publiceren
            </button>
          </motion.div>
        ) : activePoll ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white leading-tight">{activePoll.question}</h3>
              <p className="text-[9px] font-black uppercase tracking-widest text-violet-500/60">Meerdere keuzes mogelijk</p>
            </div>

            <div className="space-y-3">
              {activePoll.poll_options.map((opt: any) => {
                const voteCount = opt.poll_votes.length;
                const hasVoted = opt.poll_votes.some((v: any) => v.user_id === userId);
                
                // We berekenen percentage t.o.v. totaal aantal UNIEKE stemmers
                const totalVoters = getTotalUniqueVoters();
                const percentage = totalVoters > 0 ? (voteCount / totalVoters) * 100 : 0;
                
                return (
                  <button 
                    key={opt.id}
                    onClick={() => handleToggleVote(opt.id, hasVoted)}
                    className={`w-full relative group/opt overflow-hidden rounded-2xl border transition-all text-left ${
                      hasVoted ? 'border-violet-500 bg-violet-500/5' : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
                    }`}
                  >
                    {/* Progress Bar */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={`absolute inset-y-0 left-0 z-0 transition-colors ${
                        hasVoted ? 'bg-violet-500/20' : 'bg-slate-700/10'
                      }`}
                    />
                    
                    <div className="relative z-10 flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-4 w-4 rounded-md border flex items-center justify-center transition-colors ${
                          hasVoted ? 'bg-violet-500 border-violet-500 text-slate-950' : 'border-slate-700 bg-slate-950'
                        }`}>
                          {hasVoted && <Check className="h-3 w-3 stroke-[4px]" />}
                        </div>
                        <span className={`text-sm font-bold ${hasVoted ? 'text-white' : 'text-slate-300'}`}>
                          {opt.option_text}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-slate-500 bg-slate-950/50 px-2 py-1 rounded-lg">
                        {voteCount}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        ) : (
          <div className="py-10 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.2em]">Geen actieve poll</div>
        )}
      </AnimatePresence>
    </Card>
  )
}