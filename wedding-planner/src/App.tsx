import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Budget from './pages/Budget'
import Guests from './pages/Guests'
import Stay from './pages/Stay'
import Vendors from './pages/Vendors'
import Tasks from './pages/Tasks'
import Shopping from './pages/Shopping'
import Inspiration from './pages/Inspiration'
import Gifts from './pages/Gifts'
import PostWedding from './pages/PostWedding'
import Journal from './pages/Journal'
import OurStory from './pages/OurStory'
import Login from './pages/Login'
import CreateWedding from './pages/CreateWedding'
import SessionProvider from './context/SessionProvider'
import WeddingProvider from './context/WeddingProvider'
import { useSession } from './context/session'
import { useWedding } from './context/wedding'
import { isSupabaseConfigured } from './lib/supabase'

function App() {
  return (
    <SessionProvider>
      <WeddingProvider>
        <Gate />
      </WeddingProvider>
    </SessionProvider>
  )
}

/** Signed out → sign-in screen; signed in without a wedding → setup; otherwise the planner. */
function Gate() {
  const { session, loading: sessionLoading } = useSession()
  const { wedding, loading: weddingLoading, error } = useWedding()

  // Without Supabase there is no sign-in; the planner shows its "not configured" banner instead.
  if (!isSupabaseConfigured) return <Planner />
  if (sessionLoading || (session && weddingLoading)) {
    return <p className="flex min-h-svh items-center justify-center text-sm text-stone-400">Loading…</p>
  }
  if (!session) return <Login />
  if (!wedding) {
    if (error) return <p className="flex min-h-svh items-center justify-center p-4 text-sm text-red-600">{error}</p>
    return <CreateWedding />
  }
  return <Planner />
}

function Planner() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<Events />} />
          <Route path="budget" element={<Budget />} />
          <Route path="guests" element={<Guests />} />
          <Route path="stay" element={<Stay />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="shopping" element={<Shopping />} />
          <Route path="inspiration" element={<Inspiration />} />
          <Route path="gifts" element={<Gifts />} />
          <Route path="post-wedding" element={<PostWedding />} />
          <Route path="journal" element={<Journal />} />
          <Route path="our-story" element={<OurStory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
