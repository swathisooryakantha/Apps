import { useEffect, useState } from 'react'
import { COUPLE_PHOTOS } from '../lib/photos'

export default function PhotoBanner() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % COUPLE_PHOTOS.length), 4500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative mb-5 h-48 w-full overflow-hidden rounded-2xl md:h-64">
      {COUPLE_PHOTOS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
        {COUPLE_PHOTOS.map((src, i) => (
          <span
            key={src}
            className="h-1.5 w-1.5 rounded-full transition"
            style={{ backgroundColor: i === index ? 'white' : 'rgba(255,255,255,0.5)' }}
          />
        ))}
      </div>
    </div>
  )
}
