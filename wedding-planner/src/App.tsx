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

function App() {
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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
