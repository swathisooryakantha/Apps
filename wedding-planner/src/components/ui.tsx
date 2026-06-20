import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-rose-100 bg-white p-4 shadow-sm md:p-5 ${className}`}>
      {children}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-stone-800">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  type?: 'button' | 'submit'
  className?: string
}) {
  const styles = {
    primary: 'bg-rose-600 text-white hover:bg-rose-700',
    secondary: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  }[variant]
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${styles} ${className}`}
    >
      {children}
    </button>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-rose-400 ${props.className ?? ''}`}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-rose-400 ${props.className ?? ''}`}
    />
  )
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-rose-400 ${props.className ?? ''}`}
    />
  )
}

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-rose-100">
      <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function EmptyState({ text }: { text: string }) {
  return <p className="py-8 text-center text-sm text-stone-400">{text}</p>
}
