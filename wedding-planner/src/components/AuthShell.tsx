import { useEffect, useState, type ReactNode } from 'react'
import { STARTER_PHOTOS } from '../lib/photos'

/** Screens shown before the app itself (sign-in, setup): the starter scenes crossfade behind a card. */
export default function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % STARTER_PHOTOS.length), 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative flex min-h-svh flex-col justify-end overflow-hidden text-stone-800 md:items-center md:justify-center">
      {STARTER_PHOTOS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${i === index ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/60" />

      <div className="relative px-6 pt-10 text-center text-white md:mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/80">Plan it together</p>
        <p className="font-display text-4xl font-semibold drop-shadow-sm">Wedding Planner</p>
      </div>

      <div className="relative m-3 mb-[calc(env(safe-area-inset-bottom)+0.75rem)] rounded-3xl bg-white/90 p-6 shadow-xl backdrop-blur-md md:w-full md:max-w-sm">
        <h1 className="font-display text-2xl font-semibold text-[var(--accent-800)]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-stone-600">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}
