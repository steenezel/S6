import { QueryClientProvider } from '@tanstack/react-query'
import { useLocation, Switch, Route } from 'wouter'
import { queryClient } from './lib/queryClient'
import { Dashboard } from './components/dashboard/Dashboard'

function App() {
  const [, setLocation] = useLocation()

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/">
          <Dashboard familyName="Family Hub" />
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
