import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { WeddingSettings } from '../lib/types'
import { useSession } from './session'
import { WeddingContext } from './wedding'

const LAST_WEDDING_KEY = 'wedding-planner:last-wedding-id'

function readLastWeddingId(): string | null {
  try {
    return localStorage.getItem(LAST_WEDDING_KEY)
  } catch {
    return null
  }
}

function rememberWeddingId(id: string) {
  try {
    localStorage.setItem(LAST_WEDDING_KEY, id)
  } catch {
    // Storage can be unavailable (private mode); the first wedding is used instead.
  }
}

/** Loads the wedding the signed-in user plans in. Row Level Security limits the query to their own weddings. */
export default function WeddingProvider({ children }: { children: ReactNode }) {
  const { session } = useSession()
  const userId = session?.user.id ?? null
  const [wedding, setWedding] = useState<WeddingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!supabase || !userId) {
      setWedding(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase.from('weddings').select('*').order('created_at')
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    const weddings = (data ?? []) as WeddingSettings[]
    const lastId = readLastWeddingId()
    const current = weddings.find((w) => w.id === lastId) ?? weddings[0] ?? null
    if (current) rememberWeddingId(current.id)
    setWedding(current)
    setError(null)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() sets state asynchronously after the Supabase round-trip, not synchronously.
    load()
  }, [load])

  const createWedding = useCallback(
    async (values: { bride_name: string; groom_name: string; wedding_date: string | null }) => {
      if (!supabase) return 'Supabase is not configured.'
      const { data, error } = await supabase.rpc('create_wedding', {
        p_bride_name: values.bride_name,
        p_groom_name: values.groom_name,
        p_wedding_date: values.wedding_date,
      })
      if (error) return error.message
      const created = data as WeddingSettings
      rememberWeddingId(created.id)
      setWedding(created)
      return null
    },
    [],
  )

  const save = useCallback(
    async (values: Partial<WeddingSettings>) => {
      if (!supabase || !wedding) return
      setWedding({ ...wedding, ...values })
      const { error } = await supabase.from('weddings').update(values).eq('id', wedding.id)
      if (error) setError(error.message)
    },
    [wedding],
  )

  return (
    <WeddingContext.Provider value={{ wedding, loading, error, createWedding, save }}>
      {children}
    </WeddingContext.Provider>
  )
}
