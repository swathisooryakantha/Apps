import { useState } from 'react'
import { useTable } from '../hooks/useTable'
import type { Guest, RsvpStatus, Side } from '../lib/types'
import { Button, Card, EmptyState, Input, PageHeader, Select, Textarea } from '../components/ui'

const RSVP_STYLES: Record<RsvpStatus, string> = {
  pending: 'bg-stone-100 text-stone-500',
  yes: 'bg-emerald-100 text-emerald-700',
  no: 'bg-red-100 text-red-600',
}

export default function Guests() {
  const { rows, insert, update, remove } = useTable<Guest>('guests')
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | RsvpStatus>('all')

  const filtered = filter === 'all' ? rows : rows.filter((g) => g.rsvp_status === filter)
  const headcount = rows
    .filter((g) => g.rsvp_status === 'yes')
    .reduce((s, g) => s + 1 + (g.plus_one_count || 0), 0)

  return (
    <div>
      <PageHeader
        title="Guest List"
        subtitle={`${rows.length} invited · ${headcount} confirmed headcount`}
        action={<Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ Add guest'}</Button>}
      />

      {showForm && (
        <Card className="mb-4">
          <GuestForm
            onSave={(values) => {
              insert(values)
              setShowForm(false)
            }}
          />
        </Card>
      )}

      <div className="mb-3 flex gap-2">
        {(['all', 'pending', 'yes', 'no'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === f ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {f === 'all' ? 'All' : f === 'yes' ? 'Confirmed' : f === 'no' ? 'Declined' : 'Pending'}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <EmptyState text="No guests in this view." />}

      <div className="space-y-2">
        {filtered.map((g) => (
          <GuestRow key={g.id} guest={g} onUpdate={update} onRemove={remove} />
        ))}
      </div>
    </div>
  )
}

function GuestRow({
  guest: g,
  onUpdate,
  onRemove,
}: {
  guest: Guest
  onUpdate: (id: string, v: Partial<Guest>) => void
  onRemove: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <Card>
        <GuestForm
          initial={g}
          onSave={(values) => {
            onUpdate(g.id, values)
            setEditing(false)
          }}
        />
        <Button variant="secondary" className="mt-2" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </Card>
    )
  }

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-medium text-stone-800">
          {g.name} {g.plus_one_count > 0 && <span className="text-xs text-stone-400">+{g.plus_one_count}</span>}
        </p>
        <p className="text-xs text-stone-400">
          {g.group_name ?? '—'} · {g.side} side {g.needs_stay && '· 🏨 needs stay'}
        </p>
        {g.notes && <p className="text-xs text-stone-400">{g.notes}</p>}
      </div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-xs text-stone-500">
          <input
            type="checkbox"
            checked={g.invite_sent}
            onChange={(e) => onUpdate(g.id, { invite_sent: e.target.checked })}
          />
          Invite sent
        </label>
        <select
          value={g.rsvp_status}
          onChange={(e) => onUpdate(g.id, { rsvp_status: e.target.value as RsvpStatus })}
          className={`rounded-full px-2 py-1 text-xs font-medium ${RSVP_STYLES[g.rsvp_status]}`}
        >
          <option value="pending">Pending</option>
          <option value="yes">Confirmed</option>
          <option value="no">Declined</option>
        </select>
        <Button variant="secondary" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <Button variant="danger" onClick={() => onRemove(g.id)}>
          Delete
        </Button>
      </div>
    </Card>
  )
}

function GuestForm({ initial, onSave }: { initial?: Guest; onSave: (v: Partial<Guest>) => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [side, setSide] = useState<Side>(initial?.side ?? 'both')
  const [groupName, setGroupName] = useState(initial?.group_name ?? '')
  const [plusOne, setPlusOne] = useState(String(initial?.plus_one_count ?? '0'))
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [needsStay, setNeedsStay] = useState(initial?.needs_stay ?? false)
  const [inviteSent, setInviteSent] = useState(initial?.invite_sent ?? false)
  const [notes, setNotes] = useState(initial?.notes ?? '')

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({
          name,
          side,
          group_name: groupName,
          plus_one_count: Number(plusOne) || 0,
          phone,
          needs_stay: needsStay,
          invite_sent: inviteSent,
          notes,
          rsvp_status: initial?.rsvp_status ?? 'pending',
        })
      }}
    >
      <label className="text-sm text-stone-500">
        Name
        <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="text-sm text-stone-500">
        Side
        <Select className="mt-1" value={side} onChange={(e) => setSide(e.target.value as Side)}>
          <option value="bride">Bride's side</option>
          <option value="groom">Groom's side</option>
          <option value="both">Both</option>
        </Select>
      </label>
      <label className="text-sm text-stone-500">
        Group (e.g. family, college friends)
        <Input className="mt-1" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500">
        Plus ones
        <Input className="mt-1" type="number" min={0} value={plusOne} onChange={(e) => setPlusOne(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500">
        Phone
        <Input className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <label className="mt-6 flex items-center gap-2 text-sm text-stone-500">
        <input type="checkbox" checked={needsStay} onChange={(e) => setNeedsStay(e.target.checked)} />
        Needs accommodation
      </label>
      <label className="mt-6 flex items-center gap-2 text-sm text-stone-500">
        <input type="checkbox" checked={inviteSent} onChange={(e) => setInviteSent(e.target.checked)} />
        Invite sent
      </label>
      <label className="text-sm text-stone-500 md:col-span-2">
        Notes
        <Textarea className="mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </label>
      <Button type="submit" className="md:col-span-2">
        Save guest
      </Button>
    </form>
  )
}
