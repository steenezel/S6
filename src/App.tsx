import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Dashboard } from './components/dashboard/Dashboard';
import * as TQ from '@tanstack/react-query';

const queryClient = new (TQ as any).QueryClient();

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any).auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = (supabase as any).auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Verbeterde inlogfunctie met expliciete Google Calendar rechten
  const handleLogin = async () => {
    await (supabase as any).auth.signInWithOAuth({ 
      provider: 'google',
      options: { 
        redirectTo: window.location.origin,
        queryParams: { 
          prompt: 'consent', // Dwingt Google om het toestemmingsscherm te tonen
          access_type: 'offline', // Nodig voor het verversen van tokens
          // Voeg hier de specifieke scopes toe voor de agenda
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly'
        }
      } 
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#06080F] flex items-center justify-center text-white font-sans">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 rounded-full bg-emerald-500/20 mb-4 border border-emerald-500/40" />
        <span>Systeem laden...</span>
      </div>
    </div>
  );

  return (
    <TQ.QueryClientProvider client={queryClient}>
      {!session ? (
        <div className="min-h-screen bg-[#06080F] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden text-center">
          <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] bg-emerald-600/10 rounded-full blur-[120px]" />
          
          <h1 className="text-6xl font-black text-white mb-2 tracking-tighter italic">S6<span className="text-emerald-500">.</span></h1>
          <p className="text-slate-500 mb-10 tracking-[0.2em] font-bold text-xs uppercase">Steelant Family Hub</p>
          
          <button 
            onClick={handleLogin}
            className="bg-white text-black px-12 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.15)] relative z-10"
          >
            Inloggen met Google
          </button>
        </div>
      ) : (
        <Dashboard familyName="Steelant 6" userName={session.user?.user_metadata?.full_name?.split(' ')[0]} />
      )}
    </TQ.QueryClientProvider>
  );
}