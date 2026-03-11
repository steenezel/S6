import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Dashboard } from './components/dashboard/Dashboard';

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

  if (loading) return <div className="min-h-screen bg-[#06080F] flex items-center justify-center text-white font-sans">Laden...</div>;

  return (
    <>
      {!session ? (
        <div className="min-h-screen bg-[#06080F] flex flex-col items-center justify-center p-4 font-sans">
          <h1 className="text-5xl font-black text-white mb-8 tracking-tighter italic">S6<span className="text-emerald-500">.</span></h1>
          <button 
            onClick={() => (supabase as any).auth.signInWithOAuth({ 
              provider: 'google',
              options: { 
                redirectTo: window.location.origin,
                queryParams: { prompt: 'consent', access_type: 'offline' }
              } 
            })}
            className="bg-white text-black px-12 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            Inloggen met Google
          </button>
        </div>
      ) : (
        <Dashboard familyName="Steelant 6" userName={session.user?.user_metadata?.full_name?.split(' ')[0]} />
      )}
    </>
  );
}