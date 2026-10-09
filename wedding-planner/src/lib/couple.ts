import type { WeddingSettings } from './types'

/** "Asha & Ravi", "Asha", or null when no names are set. */
export function coupleLabel(settings: Pick<WeddingSettings, 'bride_name' | 'groom_name'> | null): string | null {
  const names = [settings?.bride_name, settings?.groom_name].filter((n): n is string => Boolean(n && n.trim()))
  return names.length ? names.join(' & ') : null
}
