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
          <Route path="gifts" element={<Gifts />} />
          <Route path="post-wedding" element={<PostWedding />} />
          <Route path="journal" element={<Journal />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
