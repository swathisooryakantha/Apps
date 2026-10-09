import { useState } from 'react'
import { supabase } from '../lib/supabase'
import AuthShell from '../components/AuthShell'
import { Button, Input } from '../components/ui'
import { signInRedirectUrl } from '../lib/invite'

export default function Login({ pendingInvite }: { pendingInvite: string | null }) {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const redirectTo = signInRedirectUrl(pendingInvite)

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
    <AuthShell
      title="Welcome"
      subtitle={
        pendingInvite
          ? "You've been invited to plan a wedding together. Sign in to accept."
          : 'Sign in with your email to start planning. No password needed.'
      }
    >
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
        <Button type="submit" disabled={sending}>
          {sending ? 'Sending…' : 'Email me a sign-in link'}
        </Button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </AuthShell>
  )
}
