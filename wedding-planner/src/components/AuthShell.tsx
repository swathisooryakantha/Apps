import type { ReactNode } from 'react'

/** Centered card layout for the screens shown before the app itself (sign-in, setup). */
export default function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center p-4 text-stone-800">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--accent-100)] bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-[var(--accent-800)]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}
