import { supabase } from './supabase'

/** Starter illustrations shown in the dashboard carousel until a couple adds their own photos. */
export const STARTER_PHOTOS = Array.from({ length: 8 }, (_, i) => `/carousel/scene-${i + 1}.jpg`)

const BUCKET = 'wedding-photos'
const MAX_DIMENSION = 1600
const SIGNED_URL_SECONDS = 60 * 60

export interface WeddingPhoto {
  path: string
  url: string
}

/** The couple's uploaded photos (oldest first), with short-lived links since the bucket is private. */
export async function listWeddingPhotos(weddingId: string): Promise<WeddingPhoto[]> {
  if (!supabase) return []
  const { data, error } = await supabase.storage.from(BUCKET).list(weddingId, { sortBy: { column: 'name', order: 'asc' } })
  if (error) throw error
  const paths = (data ?? []).filter((f) => f.id).map((f) => `${weddingId}/${f.name}`)
  if (!paths.length) return []
  const { data: signed, error: signError } = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS)
  if (signError) throw signError
  return (signed ?? []).flatMap((s) => (s.signedUrl && s.path ? [{ path: s.path, url: s.signedUrl }] : []))
}

/** Shrinks large phone photos before upload so they load quickly on every device. */
async function prepareImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    if (blob) return blob
  } catch {
    // Fall through: upload the original if it's a format the bucket accepts.
  }
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file
  throw new Error(`${file.name} isn't a supported image. Use a JPEG, PNG or WebP photo.`)
}

export async function uploadWeddingPhoto(weddingId: string, file: File) {
  if (!supabase) return
  const image = await prepareImage(file)
  const extension = image.type === 'image/png' ? 'png' : image.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${weddingId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, image, { contentType: image.type || 'image/jpeg' })
  if (error) throw error
}

export async function deleteWeddingPhotos(paths: string[]) {
  if (!supabase || !paths.length) return
  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) throw error
}

/** Removes every uploaded photo of a wedding (used before deleting the wedding itself). */
export async function deleteAllWeddingPhotos(weddingId: string) {
  if (!supabase) return
  const { data, error } = await supabase.storage.from(BUCKET).list(weddingId, { limit: 1000 })
  if (error) throw error
  await deleteWeddingPhotos((data ?? []).filter((f) => f.id).map((f) => `${weddingId}/${f.name}`))
}
