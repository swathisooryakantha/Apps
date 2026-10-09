import { useCallback, useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useSession } from '../context/session'
import { useWedding } from '../context/wedding'
import { coupleLabel } from '../lib/couple'
import { inviteUrl } from '../lib/invite'
import type { WeddingInvite, WeddingMember } from '../lib/types'
import { Button, Card, Input, PageHeader, Select } from '../components/ui'

const MAX_OWNERS = 2

// Every table that holds a wedding's planning data, for "Export my data".
const EXPORT_TABLES = [
  'events',
  'budget_items',
  'guests',
  'stay_venues',
  'stay_rooms',
  'stay_assignments',
  'vendors',
  'tasks',
  'shopping_items',
  'inspiration_items',
  'gifts',
  'story_milestones',
  'mood_entries',
  'post_wedding_items',
]

export default function Settings() {
  const { wedding, weddings, selectWedding } = useWedding()
  const [members, setMembers] = useState<WeddingMember[]>([])
  const [invite, setInvite] = useState<WeddingInvite | null>(null)
  const weddingId = wedding?.id ?? null

  const refresh = useCallback(async () => {
    if (!supabase || !weddingId) return
    const [m, i] = await Promise.all([
      supabase.from('wedding_members').select('*').eq('wedding_id', weddingId).order('created_at'),
      supabase
        .from('wedding_invites')
        .select('*')
        .eq('wedding_id', weddingId)
        .is('accepted_at', null)
        .order('created_at', { ascending: false })
        .limit(1),
    ])
    setMembers((m.data ?? []) as WeddingMember[])
    setInvite(((i.data ?? []) as WeddingInvite[])[0] ?? null)
  }, [weddingId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refresh() sets state asynchronously after the Supabase round-trip, not synchronously.
    refresh()
  }, [refresh])

  if (!wedding) return null

  return (
    <div>
      <PageHeader title="Settings" subtitle="Who's planning, your data, and your account." />

      {weddings.length > 1 && (
        <Card className="mb-4">
          <h2 className="mb-2 text-sm font-semibold text-stone-600">Your weddings</h2>
          <Select value={wedding.id} onChange={(e) => selectWedding(e.target.value)}>
            {weddings.map((w) => (
              <option key={w.id} value={w.id}>
                {coupleLabel(w) ?? 'Untitled wedding'}
              </option>
            ))}
          </Select>
        </Card>
      )}

      <MembersCard members={members} invite={invite} onChange={refresh} />
      <ExportCard />
      <DangerCard soleOwner={members.length <= 1} />
    </div>
  )
}

function MembersCard({
  members,
  invite,
  onChange,
}: {
  members: WeddingMember[]
  invite: WeddingInvite | null
  onChange: () => void
}) {
  const { session } = useSession()
  const { wedding } = useWedding()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const full = members.length >= MAX_OWNERS
  const inviteExpired = invite ? new Date(invite.expires_at) <= new Date() : false

  const createInvite = async () => {
    if (!supabase || !wedding) return
    setBusy(true)
    setError(null)
    const { error } = await supabase.rpc('create_invite', { p_wedding_id: wedding.id, p_email: email })
    setBusy(false)
    if (error) setError(error.message)
    else {
      setEmail('')
      onChange()
    }
  }

  const revokeInvite = async () => {
    if (!supabase || !invite) return
    const { error } = await supabase.from('wedding_invites').delete().eq('id', invite.id)
    if (error) setError(error.message)
    onChange()
  }

  const link = invite ? inviteUrl(invite.token) : ''
  const shareText = `Join me in planning ${coupleLabel(wedding) ?? 'our wedding'} on Wedding Planner: ${link}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("Couldn't copy automatically — select the link and copy it.")
    }
  }

  const shareLink = async () => {
    try {
      await navigator.share({ title: 'Wedding Planner invite', text: shareText })
    } catch {
      // Cancelled by the user, or sharing unavailable — the copy button still works.
    }
  }

  return (
    <Card className="mb-4">
      <h2 className="text-sm font-semibold text-stone-600">Co-owners</h2>
      <p className="mb-3 text-xs text-stone-400">
        Co-owners can see and edit everything. A wedding can have up to {MAX_OWNERS}.
      </p>
      <ul className="mb-4 grid gap-2">
        {members.map((m) => (
          <li key={m.user_id} className="flex items-center justify-between rounded-lg bg-[var(--accent-50)] px-3 py-2 text-sm">
            <span>
              <span className="font-medium">{m.display_name || m.email || 'Member'}</span>
              {m.display_name && m.email && <span className="ml-1 text-stone-400">{m.email}</span>}
            </span>
            {m.user_id === session?.user.id && <span className="text-xs text-stone-400">You</span>}
          </li>
        ))}
      </ul>

      {!full && invite && !inviteExpired && (
        <div className="rounded-lg border border-[var(--accent-100)] p-3">
          <p className="text-sm font-medium">
            Invite link{invite.email ? ` for ${invite.email}` : ''}
          </p>
          <p className="mb-2 text-xs text-stone-400">
            Works once · expires {format(parseISO(invite.expires_at), 'MMM d')}
            {invite.email ? ' · only for that email' : ' · anyone with the link can join'}
          </p>
          <Input readOnly value={link} onFocus={(e) => e.target.select()} />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button onClick={copyLink}>{copied ? 'Copied!' : 'Copy link'}</Button>
            {typeof navigator.share === 'function' && (
              <Button variant="secondary" onClick={shareLink}>
                Share…
              </Button>
            )}
            {invite.email && (
              <a
                className="rounded-lg bg-[var(--accent-50)] px-3 py-2 text-sm font-medium text-[var(--accent-700)] hover:bg-[var(--accent-100)]"
                href={`mailto:${invite.email}?subject=${encodeURIComponent('Plan our wedding with me')}&body=${encodeURIComponent(shareText)}`}
              >
                Email it
              </a>
            )}
            <Button variant="danger" onClick={revokeInvite}>
              Cancel invite
            </Button>
          </div>
        </div>
      )}

      {!full && (!invite || inviteExpired) && (
        <form
          className="grid gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            createInvite()
          }}
        >
          <p className="text-sm font-medium">Invite your partner</p>
          {inviteExpired && <p className="text-xs text-stone-400">Your last invite expired — create a new one.</p>}
          <Input
            type="email"
            placeholder="Their email (optional, recommended)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-xs text-stone-400">
            With an email, only that person can use the link. Without one, anyone who gets the link can join.
          </p>
          <Button type="submit" disabled={busy}>
            {busy ? 'Creating…' : 'Create invite link'}
          </Button>
        </form>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  )
}

function ExportCard() {
  const { wedding } = useWedding()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportData = async () => {
    if (!supabase || !wedding) return
    setBusy(true)
    setError(null)
    const tables: Record<string, unknown[]> = {}
    for (const table of EXPORT_TABLES) {
      const { data, error } = await supabase.from(table).select('*').eq('wedding_id', wedding.id)
      if (error) {
        setError(error.message)
        setBusy(false)
        return
      }
      tables[table] = data ?? []
    }
    const file = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), wedding, ...tables }, null, 2)], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(file)
    a.download = `wedding-planner-export-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    setBusy(false)
  }

  return (
    <Card className="mb-4">
      <h2 className="text-sm font-semibold text-stone-600">Your data</h2>
      <p className="mb-3 text-xs text-stone-400">
        Download everything in this wedding (guests, budget, tasks, and more) as a file you can keep as a backup.
      </p>
      <Button variant="secondary" onClick={exportData} disabled={busy}>
        {busy ? 'Preparing…' : 'Export my data'}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  )
}

function DangerCard({ soleOwner }: { soleOwner: boolean }) {
  const { wedding, leaveWedding, deleteWedding } = useWedding()
  const [confirmText, setConfirmText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const name = coupleLabel(wedding) ?? 'delete'
  const confirmed = confirmText.trim().toLowerCase() === name.toLowerCase()

  const run = async (action: () => Promise<string | null>) => {
    setBusy(true)
    setError(null)
    const err = await action()
    setBusy(false)
    if (err) setError(err)
  }

  return (
    <Card className="border-red-100">
      <h2 className="text-sm font-semibold text-red-600">Leave or delete</h2>

      {!soleOwner && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-stone-400">
            Leaving removes your access. The wedding and its data stay with your co-owner.
          </p>
          <Button
            variant="danger"
            disabled={busy}
            onClick={() => {
              if (window.confirm('Leave this wedding? You will lose access until you are invited again.')) {
                run(leaveWedding)
              }
            }}
          >
            Leave wedding
          </Button>
        </div>
      )}

      <div className="mt-4">
        <p className="mb-2 text-xs text-stone-400">
          Deleting permanently removes this wedding and everything in it{soleOwner ? '' : ' for both co-owners'}. This can't be
          undone — export your data first if you want a copy. Type <strong className="text-stone-600">{name}</strong> to
          confirm.
        </p>
        <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={name} />
        <Button variant="danger" className="mt-2" disabled={!confirmed || busy} onClick={() => run(deleteWedding)}>
          Delete wedding permanently
        </Button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  )
}
