import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { WeddingSettings } from '../lib/types'

export function useWeddingSettings() {
  const [settings, setSettings] = useState<WeddingSettings | null>(null)

  const refresh = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase.from('wedding_settings').select('*').limit(1).maybeSingle()
    setSettings(data as WeddingSettings | null)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refresh() sets state asynchronously after the Supabase round-trip, not synchronously.
    refresh()
  }, [refresh])

  const save = useCallback(
    async (values: Partial<WeddingSettings>) => {
      if (!supabase) return
      if (settings) {
        await supabase.from('wedding_settings').update(values).eq('id', settings.id)
        setSettings({ ...settings, ...values })
      } else {
        const { data } = await supabase.from('wedding_settings').insert(values).select().single()
        setSettings(data as WeddingSettings)
      }
    },
    [settings],
  )

  return { settings, save }
}
