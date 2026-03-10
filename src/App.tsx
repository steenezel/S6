import { QueryClientProvider } from '@tanstack/react-query'
import { useLocation, Switch, Route } from 'wouter'
import { queryClient } from './lib/queryClient'
import { Dashboard } from './components/dashboard/Dashboard'
import { supabase } from './lib/supabase'

function GoogleLoginButton() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="px-4 py-2 rounded-full bg-sky-500 text-slate-950 text-sm font-medium hover:bg-sky-400 transition-colors"
    >
      Login met Google
    </button>
  )
}

function App() {
  const [, setLocation] = useLocation()

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/">
          <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
            <header className="w-full border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-xl">
              <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Family Hub
                  </span>
                  <span className="text-xs text-slate-500">
                    Google login voor agenda & profiel
                  </span>
                </div>
                <GoogleLoginButton />
              </div>
            </header>
            <div className="flex-1">
              <Dashboard familyName="Family Hub" />
            </div>
          </div>
        </Route>

        <Route>
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
            <h1 className="text-3xl font-semibold mb-4">Pagina niet gevonden</h1>
            <button
              type="button"
              onClick={() => setLocation('/')}
              className="px-4 py-2 rounded-full bg-sky-500 text-slate-950 text-sm font-medium hover:bg-sky-400 transition-colors"
            >
              Terug naar dashboard
            </button>
          </div>
        </Route>
      </Switch>
    </QueryClientProvider>
  )
}

export default App
