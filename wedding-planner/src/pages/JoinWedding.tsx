import { useEffect, useState } from 'react'
import { signOut, supabase } from '../lib/supabase'
import { useWedding } from '../context/wedding'
import { useSession } from '../context/session'
import { coupleLabel } from '../lib/couple'
import type { InviteStatus } from '../lib/types'
import AuthShell from '../components/AuthShell'
import { Button } from '../components/ui'

interface Preview {
  bride_name: string | null
  groom_name: string | null
  status: InviteStatus
  invited_email: string | null
}

const STATUS_MESSAGES: Record<Exclude<InviteStatus, 'valid' | 'already_member'>, string> = {
  expired: 'This invite link has expired. Ask your partner to send a new one from Settings.',
  used: 'This invite link has already been used. Ask your partner to send a new one from Settings.',
  wrong_email: '',
  full: 'This wedding already has two co-owners.',
  not_found: "This invite link isn't valid. Check that you opened the full link.",
}

/** Shown after sign-in when the person arrived through an invite link. */
export default function JoinWedding({ token, onDone }: { token: string; onDone: () => void }) {
  const { joinWedding } = useWedding()
  const { session } = useSession()
  const [preview, setPreview] = useState<Preview | null>(null)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase.rpc('invite_preview', { p_token: token }).then(({ data, error }) => {
      if (error) setError(error.message)
      else setPreview(((data ?? []) as Preview[])[0] ?? { bride_name: null, groom_name: null, status: 'not_found', invited_email: null })
    })
  }, [token])

  const join = async () => {
    setJoining(true)
    const err = await joinWedding(token)
    setJoining(false)
    if (err) setError(err)
    else onDone()
  }

  // Already in this wedding (e.g. opened the link twice): just open it.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- join() sets state after the Supabase round-trip.
    if (preview?.status === 'already_member') join()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when the preview arrives.
  }, [preview?.status])

  const names = coupleLabel(preview)
  const title = names ? `Join ${names}'s wedding` : 'Join a wedding'

  if (!preview && !error) {
    return <p className="flex min-h-svh items-center justify-center text-sm text-stone-400">Checking your invite…</p>
  }

  if (preview && preview.status !== 'valid' && preview.status !== 'already_member') {
    const message =
      preview.status === 'wrong_email'
        ? `This invite is for ${preview.invited_email}, but you're signed in as ${session?.user.email}. Sign out and sign in with that email to accept it.`
        : STATUS_MESSAGES[preview.status]
    return (
      <AuthShell title={title} subtitle={message}>
        <div className="grid gap-2">
          {preview.status === 'wrong_email' && (
            <Button onClick={() => signOut()}>Sign out</Button>
          )}
          <Button variant="secondary" onClick={onDone}>
            Continue without joining
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title={title}
      subtitle="You'll be a co-owner: you can see and edit everything, and plan together from any device."
    >
      <div className="grid gap-2">
        <Button onClick={join} disabled={joining}>
          {joining ? 'Joining…' : 'Join wedding'}
        </Button>
        <Button variant="secondary" onClick={onDone} disabled={joining}>
          Not now
        </Button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </AuthShell>
  )
}
