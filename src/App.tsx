import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Dashboard } from './components/dashboard/Dashboard';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Haal de initiële sessie op
    (supabase as any).auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setLoading(false);
    });

    // Luister naar in/uitloggen
    const { data: { subscription } } = (supabase as any).auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-[#06080F] flex items-center justify-center text-white">Laden...</div>;

  return (
    <>
      {!session ? (
        <div className="min-h-screen bg-[#06080F] flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl font-black text-white mb-8 tracking-tighter text-center">S6 GEZINSAPP</h1>
          <button 
            onClick={() => (supabase as any).auth.signInWithOAuth({ 
              provider: 'google',
              options: { redirectTo: window.location.origin } 
            })}
            className="bg-white text-black px-10 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-xl"
          >
            Inloggen met Google
          </button>
        </div>
      ) : (
        /* HIER WORDT HET VOLLEDIGE DASHBOARD WEER GELADEN */
        <Dashboard familyName="Steelant 6" userName={session.user?.user_metadata?.full_name?.split(' ')[0]} />
      )}
    </>
  );
}