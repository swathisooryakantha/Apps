import { NavLink, Outlet } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/supabase'

const NAV_ITEMS = [
  { to: '/', label: 'Today' },
  { to: '/history', label: 'History' },
  { to: '/settings', label: 'Settings' },
]

export default function Layout() {
  return (
    <div className="flex min-h-svh flex-col">
      {!isSupabaseConfigured && (
        <div className="bg-amber-200 px-4 py-2 text-center text-sm font-medium text-amber-900">
          Supabase isn't configured yet — nothing will be saved. See README for setup.
        </div>
      )}

      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 pt-6 pb-2 md:px-0">
        <span className="font-display text-base text-[var(--paper)]/90">Daily Companion</span>
        <nav className="flex gap-1 rounded-full bg-white/5 p-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  isActive ? 'bg-[var(--accent)] text-[#1e1b38]' : 'text-[var(--paper)]/60 hover:text-[var(--paper)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-5 py-6 md:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
