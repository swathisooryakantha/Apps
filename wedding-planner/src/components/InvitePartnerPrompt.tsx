import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useWedding } from '../context/wedding'

const dismissedKey = (weddingId: string) => `wedding-planner:invite-prompt-dismissed:${weddingId}`

function isDismissed(weddingId: string) {
  try {
    return localStorage.getItem(dismissedKey(weddingId)) === '1'
  } catch {
    return false
  }
}

/** Small dashboard nudge, shown while the wedding has only one co-owner. */
export default function InvitePartnerPrompt() {
  const weddingId = useWedding().wedding?.id ?? null
  const [soloOwner, setSoloOwner] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!supabase || !weddingId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a per-wedding preference when the wedding changes.
    setDismissed(isDismissed(weddingId))
    supabase
      .from('wedding_members')
      .select('user_id', { count: 'exact', head: true })
      .eq('wedding_id', weddingId)
      .then(({ count }) => setSoloOwner(count === 1))
  }, [weddingId])

  if (!weddingId || !soloOwner || dismissed) return null

  return (
    <div className="mb-5 flex items-center gap-3 rounded-xl border border-[var(--accent-100)] bg-[var(--accent-50)] px-3 py-2 text-sm">
      <span aria-hidden>💌</span>
      <Link to="/settings#invite" className="flex-1 font-medium text-[var(--accent-700)]">
        Invite your partner to plan together →
      </Link>
      <button
        aria-label="Dismiss"
        className="px-1 text-stone-400 hover:text-stone-600"
        onClick={() => {
          try {
            localStorage.setItem(dismissedKey(weddingId), '1')
          } catch {
            // Without storage it simply shows again next time.
          }
          setDismissed(true)
        }}
      >
        ✕
      </button>
    </div>
  )
}
