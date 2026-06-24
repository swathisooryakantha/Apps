import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

/** Generic CRUD hook backed by a Supabase table, with optimistic local state. */
export function useTable<T extends { id: string }>(
  table: string,
  orderBy: { column: string; ascending?: boolean } = { column: 'created_at', ascending: true },
) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderBy.column, { ascending: orderBy.ascending ?? true })
    if (error) setError(error.message)
    else setRows((data ?? []) as T[])
    setLoading(false)
  }, [table, orderBy.column, orderBy.ascending])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refresh() sets state asynchronously after the Supabase round-trip, not synchronously.
    refresh()
  }, [refresh])

  const insert = useCallback(
    async (values: Partial<T>): Promise<T | null> => {
      if (!supabase) return null
      const { data, error } = await supabase
        .from(table)
        .insert(values as never)
        .select()
        .single()
      if (error) {
        setError(error.message)
        return null
      }
      setRows((prev) => [...prev, data as T])
      return data as T
    },
    [table],
  )

  const update = useCallback(
    async (id: string, values: Partial<T>) => {
      if (!supabase) return
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...values } : r)))
      const { error } = await supabase.from(table).update(values as never).eq('id', id)
      if (error) setError(error.message)
    },
    [table],
  )

  const remove = useCallback(
    async (id: string) => {
      if (!supabase) return
      setRows((prev) => prev.filter((r) => r.id !== id))
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) setError(error.message)
    },
    [table],
  )

  return { rows, loading, error, refresh, insert, update, remove, configured: isSupabaseConfigured }
}
