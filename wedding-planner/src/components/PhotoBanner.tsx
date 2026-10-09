import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWeddingSettings } from '../hooks/useWeddingSettings'
import { useWeddingPhotos } from '../hooks/useWeddingPhotos'
import { STARTER_PHOTOS } from '../lib/photos'

/** Dashboard carousel: the couple's own photos, plus the starter illustrations unless they've turned them off. */
export default function PhotoBanner() {
  const { settings } = useWeddingSettings()
  const { photos, loading } = useWeddingPhotos()
  const [index, setIndex] = useState(0)

  const showStarters = settings?.show_default_photos ?? true
  const chosen = [...photos.map((p) => p.url), ...(showStarters ? STARTER_PHOTOS : [])]
  // Never leave the dashboard blank: fall back to the starters if nothing else is chosen.
  const slides = loading ? [] : chosen.length ? chosen : STARTER_PHOTOS
  const current = slides.length ? index % slides.length : 0

  useEffect(() => {
    if (slides.length < 2) return
    const id = setInterval(() => setIndex((i) => i + 1), 4500)
    return () => clearInterval(id)
  }, [slides.length])

  return (
    <div className="relative mb-5 h-80 w-full overflow-hidden rounded-2xl bg-[var(--accent-50)] md:h-96">
      {slides.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={src} alt="" className="h-full w-full scale-110 object-cover blur-2xl" />
          <img src={src} alt="" className="absolute inset-0 h-full w-full object-contain" />
        </div>
      ))}
      <Link
        to="/settings#photos"
        className="absolute right-2 top-2 rounded-full bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/50"
      >
        Change photos
      </Link>
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {slides.map((src, i) => (
            <span
              key={src}
              className="h-1.5 w-1.5 rounded-full transition"
              style={{ backgroundColor: i === current ? 'white' : 'rgba(255,255,255,0.5)' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
