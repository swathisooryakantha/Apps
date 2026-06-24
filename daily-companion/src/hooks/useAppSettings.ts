import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { AppSettings } from '../lib/types'

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    const { data } = await supabase.from('app_settings').select('*').limit(1).maybeSingle()
    setSettings(data as AppSettings | null)
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refresh() sets state asynchronously after the Supabase round-trip, not synchronously.
    refresh()
  }, [refresh])

  const start = useCallback(async (challengeLength: 30 | 75) => {
    if (!supabase) return
    const { data } = await supabase
      .from('app_settings')
      .insert({ challenge_length: challengeLength, start_date: new Date().toISOString().slice(0, 10) })
      .select()
      .single()
    setSettings(data as AppSettings)
  }, [])

  return { settings, loading, start }
}
