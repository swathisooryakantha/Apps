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

/** Loads the weddings the signed-in user plans in. Row Level Security limits the query to their own weddings. */
export default function WeddingProvider({ children }: { children: ReactNode }) {
  const { session } = useSession()
  const userId = session?.user.id ?? null
  const [weddings, setWeddings] = useState<WeddingSettings[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  // Which user's weddings are loaded; later reloads (after joining, leaving…) happen quietly in the background.
  const [loadedFor, setLoadedFor] = useState<string | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const loading = Boolean(supabase) && loadedFor !== userId

  const load = useCallback(
    async (preferredId?: string) => {
      if (!supabase || !userId) {
        setWeddings([])
        setCurrentId(null)
        setLoadedFor(null)
        return
      }
      const { data, error } = await supabase.from('weddings').select('*').order('created_at')
      if (error) {
        setError(error.message)
        setLoadedFor(userId)
        return
      }
      const list = (data ?? []) as WeddingSettings[]
      const wantedId = preferredId ?? readLastWeddingId()
      const current = list.find((w) => w.id === wantedId) ?? list[0] ?? null
      if (current) rememberWeddingId(current.id)
      setWeddings(list)
      setCurrentId(current?.id ?? null)
      setError(null)
      setLoadedFor(userId)
    },
    [userId],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() sets state asynchronously after the Supabase round-trip, not synchronously.
    load()
  }, [load])

  const wedding = weddings.find((w) => w.id === currentId) ?? null

  const createWedding = useCallback(
    async (values: { bride_name: string; groom_name: string; wedding_date: string | null }) => {
      if (!supabase) return 'Supabase is not configured.'
      const { data, error } = await supabase.rpc('create_wedding', {
        p_bride_name: values.bride_name,
        p_groom_name: values.groom_name,
        p_wedding_date: values.wedding_date,
      })
      if (error) return error.message
      await load((data as WeddingSettings).id)
      return null
    },
    [load],
  )

  const joinWedding = useCallback(
    async (token: string) => {
      if (!supabase) return 'Supabase is not configured.'
      const { data, error } = await supabase.rpc('accept_invite', { p_token: token })
      if (error) return error.message
      await load(data as string)
      return null
    },
    [load],
  )

  const leaveWedding = useCallback(async () => {
    if (!supabase || !currentId) return 'No wedding selected.'
    const { error } = await supabase.rpc('leave_wedding', { p_wedding_id: currentId })
    if (error) return error.message
    await load()
    return null
  }, [currentId, load])

  const deleteWedding = useCallback(async () => {
    if (!supabase || !currentId) return 'No wedding selected.'
    const { data, error } = await supabase.from('weddings').delete().eq('id', currentId).select('id')
    if (error) return error.message
    if (!data?.length) return "This wedding couldn't be deleted."
    await load()
    return null
  }, [currentId, load])

  const selectWedding = useCallback((id: string) => {
    rememberWeddingId(id)
    setCurrentId(id)
  }, [])

  const save = useCallback(
    async (values: Partial<WeddingSettings>) => {
      if (!supabase || !currentId) return
      setWeddings((prev) => prev.map((w) => (w.id === currentId ? { ...w, ...values } : w)))
      const { error } = await supabase.from('weddings').update(values).eq('id', currentId)
      if (error) setError(error.message)
    },
    [currentId],
  )

  return (
    <WeddingContext.Provider
      value={{ wedding, weddings, loading, error, createWedding, joinWedding, leaveWedding, deleteWedding, selectWedding, save }}
    >
      {children}
    </WeddingContext.Provider>
  )
}
