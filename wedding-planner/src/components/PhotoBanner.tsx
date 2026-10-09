import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWeddingSettings } from '../hooks/useWeddingSettings'
import { useWeddingPhotos } from '../hooks/useWeddingPhotos'
import { STARTER_PHOTOS } from '../lib/photos'

/** Dashboard carousel: the couple's own photos, plus the starter illustrations unless they've turned them off. */
export default function PhotoBanner() {
  const { settings } = useWeddingSettings()
  const { photos, loading } = useWeddingPhotos()
  const [index, setIndex] = useState(0)
  const swipeStartX = useRef<number | null>(null)

  const showStarters = settings?.show_default_photos ?? true
  const chosen = [...photos.map((p) => p.url), ...(showStarters ? STARTER_PHOTOS : [])]
  // Never leave the dashboard blank: fall back to the starters if nothing else is chosen.
  const slides = loading ? [] : chosen.length ? chosen : STARTER_PHOTOS
  const current = slides.length ? index % slides.length : 0

  // Auto-advance; restarts after every manual swipe or tap so the next slide doesn't jump in right away.
  useEffect(() => {
    if (slides.length < 2) return
    const id = setTimeout(() => setIndex((i) => i + 1), 4500)
    return () => clearTimeout(id)
  }, [index, slides.length])

  const go = (step: number) => setIndex((i) => (((i + step) % slides.length) + slides.length) % slides.length)

  return (
    <div
      className="relative mb-5 h-80 w-full touch-pan-y select-none overflow-hidden rounded-2xl bg-[var(--accent-50)] md:h-96"
      onPointerDown={(e) => {
        swipeStartX.current = e.clientX
      }}
      onPointerUp={(e) => {
        if (swipeStartX.current === null || slides.length < 2) return
        const dx = e.clientX - swipeStartX.current
        swipeStartX.current = null
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
      }}
      onPointerCancel={() => {
        swipeStartX.current = null
      }}
    >
      {slides.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={src} alt="" draggable={false} className="h-full w-full scale-110 object-cover blur-2xl" />
          <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain" />
        </div>
      ))}
      <Link
        to="/settings#photos"
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute right-2 top-2 rounded-full bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/50"
      >
        Change photos
      </Link>
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {slides.map((src, i) => (
            <button
              key={src}
              onClick={() => setIndex(i)}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label={`Show photo ${i + 1}`}
              className="flex h-5 w-4 items-center justify-center"
            >
              <span
                className="h-1.5 w-1.5 rounded-full transition"
                style={{ backgroundColor: i === current ? 'white' : 'rgba(255,255,255,0.5)' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
