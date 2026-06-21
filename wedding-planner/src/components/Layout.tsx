import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/supabase'
import { useWeddingSettings } from '../hooks/useWeddingSettings'
import { COUPLE_PHOTOS } from '../lib/photos'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/events', label: 'Events', icon: '📅' },
  { to: '/budget', label: 'Budget', icon: '💰' },
  { to: '/guests', label: 'Guests', icon: '👥' },
  { to: '/stay', label: 'Stay', icon: '🏨' },
  { to: '/vendors', label: 'Vendors', icon: '🤝' },
  { to: '/tasks', label: 'Checklist', icon: '✅' },
  { to: '/shopping', label: 'Shopping & Prep', icon: '🛍️' },
  { to: '/inspiration', label: 'Inspiration', icon: '📸' },
  { to: '/gifts', label: 'Gifts', icon: '🎁' },
  { to: '/post-wedding', label: 'Post-Wedding', icon: '🏡' },
  { to: '/journal', label: 'Mood Journal', icon: '📓' },
]

const MOBILE_PRIMARY = NAV_ITEMS.slice(0, 4)
const MOBILE_MORE = NAV_ITEMS.slice(4)

export default function Layout() {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()
  const moreIsActive = MOBILE_MORE.some((item) => item.to === location.pathname)
  const { settings } = useWeddingSettings()

  const coupleNames =
    settings?.bride_name || settings?.groom_name
      ? `${settings?.bride_name ?? ''}${settings?.bride_name && settings?.groom_name ? ' & ' : ''}${settings?.groom_name ?? ''}`.trim()
      : null

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', settings?.theme_color || '#e11d48')
  }, [settings?.theme_color])

  useEffect(() => {
    document.title = coupleNames ? `${coupleNames} — Wedding Planner` : 'Swathvika Wedding'
  }, [coupleNames])

  return (
    <div className="flex min-h-svh flex-col text-stone-800 md:flex-row">
      {!isSupabaseConfigured && (
        <div className="bg-amber-200 px-4 py-2 text-center text-sm font-medium text-amber-900 md:fixed md:inset-x-0 md:top-0 md:z-50">
          Supabase isn't configured yet — data won't be saved or synced. See README for setup.
        </div>
      )}

      {/* Sidebar (desktop / iPad landscape) */}
      <aside className="hidden w-60 shrink-0 border-r border-[var(--accent-100)] bg-white/70 p-5 backdrop-blur md:flex md:flex-col md:gap-1">
        <div className="mb-5 flex items-center gap-2 px-2">
          <img
            src={COUPLE_PHOTOS[0]}
            alt=""
            className="h-9 w-9 rounded-full border border-[var(--accent-100)] object-cover"
          />
          <div>
            <h1 className="font-display text-lg font-semibold leading-tight text-[var(--accent-800)]">
              {coupleNames || 'Our Wedding'}
            </h1>
            <p className="text-xs text-stone-400">Plan it together, beautifully.</p>
          </div>
        </div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-[var(--accent-100)] text-[var(--accent-700)] shadow-sm'
                  : 'text-stone-600 hover:bg-[var(--accent-50)]'
              }`
            }
          >
            <span className="mr-2.5">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
        <div className="mx-auto w-full max-w-5xl p-4 md:p-10">
          <Outlet />
        </div>
      </main>

      {/* "More" sheet (mobile / phone) */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 md:hidden" onClick={() => setMoreOpen(false)}>
          <div
            className="w-full rounded-t-2xl bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-stone-200" />
            <div className="grid grid-cols-3 gap-2">
              {MOBILE_MORE.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs font-medium ${
                      isActive ? 'bg-[var(--accent-100)] text-[var(--accent-700)]' : 'bg-[var(--accent-50)]/60 text-stone-600'
                    }`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar (mobile / phone) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[var(--accent-100)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.04)] md:hidden">
        {MOBILE_PRIMARY.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium ${
                isActive ? 'text-[var(--accent-700)]' : 'text-stone-400'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={() => setMoreOpen((o) => !o)}
          className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium ${
            moreOpen || moreIsActive ? 'text-[var(--accent-700)]' : 'text-stone-400'
          }`}
        >
          <span className="text-base">⋯</span>
          More
        </button>
      </nav>
    </div>
  )
}
