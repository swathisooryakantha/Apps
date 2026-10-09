import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { isSupabaseConfigured, signOut, supabase } from '../lib/supabase'
import { useWeddingSettings } from '../hooks/useWeddingSettings'
import { useTable } from '../hooks/useTable'
import { useDueReminders } from '../hooks/useDueReminders'
import { getNotificationPermission, notificationsSupported, requestNotificationPermission } from '../lib/notifications'
import type { EventRow, Task } from '../lib/types'
import { MOBILE_PRIMARY_PATHS, visibleGroups } from '../lib/nav'


export default function Layout() {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()
  const { settings } = useWeddingSettings()
  const groups = visibleGroups(settings?.hidden_sections ?? [])
  const visibleItems = groups.flatMap((g) => g.items)
  const mobilePrimary = MOBILE_PRIMARY_PATHS.flatMap((path) => visibleItems.filter((i) => i.to === path))
  const moreGroups = groups
    .map((g) => ({ ...g, items: g.items.filter((i) => !MOBILE_PRIMARY_PATHS.includes(i.to)) }))
    .filter((g) => g.items.length)
  const moreIsActive = moreGroups.some((g) => g.items.some((item) => item.to === location.pathname))
  const { rows: events } = useTable<EventRow>('events')
  const { rows: tasks } = useTable<Task>('tasks')
  const [notifPermission, setNotifPermission] = useState(getNotificationPermission())

  useDueReminders(events, tasks)

  const coupleNames =
    settings?.bride_name || settings?.groom_name
      ? `${settings?.bride_name ?? ''}${settings?.bride_name && settings?.groom_name ? ' & ' : ''}${settings?.groom_name ?? ''}`.trim()
      : null

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', settings?.theme_color || '#e11d48')
  }, [settings?.theme_color])

  useEffect(() => {
    document.title = coupleNames ? `${coupleNames} — Wedding Planner` : 'Wedding Planner'
  }, [coupleNames])

  return (
    <div className="flex min-h-svh flex-col text-stone-800 md:flex-row">
      {!isSupabaseConfigured && (
        <div className="bg-amber-200 px-4 py-2 text-center text-sm font-medium text-amber-900 md:fixed md:inset-x-0 md:top-0 md:z-50">
          Supabase isn't configured yet — data won't be saved or synced. See README for setup.
        </div>
      )}

      {notificationsSupported() && notifPermission === 'default' && (
        <div className="flex flex-wrap items-center justify-center gap-2 bg-[var(--accent-100)] px-4 py-2 text-center text-sm font-medium text-[var(--accent-800)]">
          Get reminders for events and task due dates on this device.
          <button
            className="rounded-full bg-[var(--accent-700)] px-3 py-1 text-xs font-semibold text-white"
            onClick={async () => setNotifPermission(await requestNotificationPermission())}
          >
            Enable notifications
          </button>
        </div>
      )}

      {/* Sidebar (desktop / iPad landscape) */}
      <aside className="hidden w-60 shrink-0 md:sticky md:top-0 md:h-svh md:overflow-y-auto border-r border-[var(--accent-100)] bg-white/70 p-5 backdrop-blur md:flex md:flex-col md:gap-1">
        <div className="mb-5 flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--accent-100)] bg-[var(--accent-50)] text-base" aria-hidden>
            💍
          </span>
          <div>
            <h1 className="font-display text-lg font-semibold leading-tight text-[var(--accent-800)]">
              {coupleNames || 'Our Wedding'}
            </h1>
            <p className="text-xs text-stone-400">Plan it together, beautifully.</p>
          </div>
        </div>
        {groups.map((group, gi) => (
          <div key={group.title ?? `group-${gi}`} className="flex flex-col gap-0.5">
            {group.title && (
              <p className="mt-3 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400">{group.title}</p>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-medium transition ${
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
          </div>
        ))}
        {supabase && (
          <button
            onClick={() => signOut()}
            className="mt-auto rounded-xl px-3 py-2.5 text-left text-sm font-medium text-stone-400 hover:bg-[var(--accent-50)]"
          >
            <span className="mr-2.5">↩</span>
            Sign out
          </button>
        )}
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
            <div className="max-h-[65svh] space-y-3 overflow-y-auto">
              {moreGroups.map((group, gi) => (
                <div key={group.title ?? `group-${gi}`}>
                  {group.title && (
                    <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400">{group.title}</p>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    {group.items.map((item) => (
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
              ))}
            </div>
            {supabase && (
              <button
                onClick={() => signOut()}
                className="mt-3 w-full rounded-xl py-2.5 text-sm font-medium text-stone-500 bg-stone-100"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom tab bar (mobile / phone) */}
      <nav
        style={{ gridTemplateColumns: `repeat(${mobilePrimary.length + 1}, minmax(0, 1fr))` }}
        className="fixed inset-x-0 bottom-0 z-40 grid border-t border-[var(--accent-100)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.04)] md:hidden">
        {mobilePrimary.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
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
