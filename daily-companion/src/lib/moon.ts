const PHASES = [
  { name: 'New moon', symbol: '🌑' },
  { name: 'Waxing crescent', symbol: '🌒' },
  { name: 'First quarter', symbol: '🌓' },
  { name: 'Waxing gibbous', symbol: '🌔' },
  { name: 'Full moon', symbol: '🌕' },
  { name: 'Waning gibbous', symbol: '🌖' },
  { name: 'Last quarter', symbol: '🌗' },
  { name: 'Waning crescent', symbol: '🌘' },
]

/** Rough moon phase for a calendar date — a small symbolic touch, not an almanac. */
export function moonPhase(dateStr: string): { name: string; symbol: string } {
  const date = new Date(`${dateStr}T12:00:00Z`)
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14)
  const synodicMonth = 29.530588853
  const daysSince = (date.getTime() - knownNewMoon) / 86400000
  const phaseFraction = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth / synodicMonth
  const index = Math.round(phaseFraction * 8) % 8
  return PHASES[index]
}
