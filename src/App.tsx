import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // We maken een referentie naar de auth client om herhaling te voorkomen
  // Door 'as any' te gebruiken, negeren we de foutmeldingen in de editor
  const auth = (supabase as any).auth;

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data } = await auth.getSession();
        setSession(data.session);
      } catch (err) {
        console.error("Sessie ophalen mislukt:", err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [auth]);

  const handleLogin = async () => {
    try {
      const { error } = await auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly'
          },
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      alert("Login fout: " + err.message);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
  };

  if (loading) return <div className="p-10">Laden...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-10 border-b pb-4">
        <h1 className="text-3xl font-black text-blue-600">S6</h1>
        {session && (
          <button onClick={handleSignOut} className="text-sm text-gray-500 underline">
            Uitloggen
          </button>
        )}
      </div>

      {!session ? (
        <div className="text-center py-20 bg-white shadow-xl rounded-3xl border border-gray-100">
          <h2 className="text-2xl font-bold mb-6">Steelant 6 Gezinsapp</h2>
          <button 
            onClick={handleLogin}
            className="bg-black text-white px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform"
          >
            Inloggen met Google
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <h3 className="text-xl font-bold mb-4">📅 Agenda</h3>
            <p className="text-sm text-blue-700">Gezinsafspraken laden...</p>
          </section>
          
          <section className="p-6 bg-green-50 rounded-2xl border border-green-100">
            <h3 className="text-xl font-bold mb-4">🛒 Boodschappen</h3>
            <p className="text-sm text-green-700">Lijst wordt gesynchroniseerd...</p>
          </section>
        </div>
      )}
    </div>
  );
}