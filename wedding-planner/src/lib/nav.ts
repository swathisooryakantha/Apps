export interface NavItem {
  to: string
  label: string
  icon: string
  /** Couples can hide optional sections they don't need (Settings → Sections). */
  optional?: boolean
}

export interface NavGroup {
  title: string | null
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  { title: null, items: [{ to: '/', label: 'Dashboard', icon: '🏠' }] },
  {
    title: 'Plan',
    items: [
      { to: '/tasks', label: 'Checklist', icon: '✅' },
      { to: '/events', label: 'Events', icon: '📅', optional: true },
      { to: '/shopping', label: 'Shopping & Prep', icon: '🛍️', optional: true },
    ],
  },
  {
    title: 'Money',
    items: [
      { to: '/budget', label: 'Budget', icon: '💰' },
      { to: '/vendors', label: 'Vendors', icon: '🤝', optional: true },
    ],
  },
  {
    title: 'People',
    items: [
      { to: '/guests', label: 'Guests', icon: '👥', optional: true },
      { to: '/stay', label: 'Stay', icon: '🏨', optional: true },
      { to: '/gifts', label: 'Gifts', icon: '🎁', optional: true },
    ],
  },
  { title: 'Ideas', items: [{ to: '/inspiration', label: 'Inspiration', icon: '📸', optional: true }] },
  {
    title: 'Us',
    items: [
      { to: '/our-story', label: 'Our Story', icon: '💌', optional: true },
      { to: '/journal', label: 'Mood Journal', icon: '📓', optional: true },
    ],
  },
  { title: null, items: [{ to: '/settings', label: 'Settings', icon: '⚙️' }] },
]

/** The phone's bottom bar; everything else lives under "More". */
export const MOBILE_PRIMARY_PATHS = ['/', '/events', '/budget', '/tasks']

export const OPTIONAL_SECTIONS = NAV_GROUPS.flatMap((g) => g.items).filter((i) => i.optional)

export function visibleGroups(hidden: string[]): NavGroup[] {
  return NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !hidden.includes(i.to)) })).filter((g) => g.items.length)
}
