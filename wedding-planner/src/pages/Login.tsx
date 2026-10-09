import { useState } from 'react'
import { supabase } from '../lib/supabase'
import AuthShell from '../components/AuthShell'
import { Button, Input } from '../components/ui'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const redirectTo = window.location.origin

  const signInWithGoogle = async () => {
    if (!supabase) return
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
    if (error) setError(error.message)
  }

  const sendMagicLink = async () => {
    if (!supabase || !email.trim()) return
    setSending(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo } })
    setSending(false)
    if (error) setError(error.message)
    else setSentTo(email.trim())
  }

  if (sentTo) {
    return (
      <AuthShell title="Check your email" subtitle={`We sent a sign-in link to ${sentTo}. Open it on this device to continue.`}>
        <Button variant="secondary" className="w-full" onClick={() => setSentTo(null)}>
          Use a different email
        </Button>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Wedding Planner" subtitle="Plan it together, beautifully. Sign in to get started.">
      <Button className="w-full" onClick={signInWithGoogle}>
        Continue with Google
      </Button>

      <div className="my-4 flex items-center gap-3 text-xs text-stone-400">
        <span className="h-px flex-1 bg-stone-200" />
        or
        <span className="h-px flex-1 bg-stone-200" />
      </div>

      <form
        className="grid gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          sendMagicLink()
        }}
      >
        <Input
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" variant="secondary" disabled={sending}>
          {sending ? 'Sending…' : 'Email me a sign-in link'}
        </Button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </AuthShell>
  )
}
