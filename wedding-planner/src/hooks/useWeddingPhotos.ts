import { useCallback, useEffect, useState } from 'react'
import { useWedding } from '../context/wedding'
import { deleteWeddingPhotos, listWeddingPhotos, uploadWeddingPhoto, type WeddingPhoto } from '../lib/photos'

/** The current wedding's uploaded carousel photos. */
export function useWeddingPhotos() {
  const weddingId = useWedding().wedding?.id ?? null
  const [photos, setPhotos] = useState<WeddingPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!weddingId) {
      setPhotos([])
      setLoading(false)
      return
    }
    try {
      setPhotos(await listWeddingPhotos(weddingId))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
    setLoading(false)
  }, [weddingId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refresh() sets state asynchronously after the Supabase round-trip, not synchronously.
    refresh()
  }, [refresh])

  const upload = useCallback(
    async (files: File[]) => {
      if (!weddingId) return
      setError(null)
      for (const file of files) {
        try {
          await uploadWeddingPhoto(weddingId, file)
        } catch (e) {
          setError((e as Error).message)
        }
      }
      await refresh()
    },
    [weddingId, refresh],
  )

  const remove = useCallback(
    async (path: string) => {
      setPhotos((prev) => prev.filter((p) => p.path !== path))
      try {
        await deleteWeddingPhotos([path])
      } catch (e) {
        setError((e as Error).message)
        await refresh()
      }
    },
    [refresh],
  )

  return { photos, loading, error, upload, remove }
}
