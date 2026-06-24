import { useState } from 'react'
import { format } from 'date-fns'
import { useAppSettings } from '../hooks/useAppSettings'
import { useTable } from '../hooks/useTable'
import type { Routine } from '../lib/types'
import { Button, Card, EmptyState, Input } from '../components/ui'

export default function Settings() {
  const { settings } = useAppSettings()
  const { rows: routines, insert, remove } = useTable<Routine>('routines', { column: 'sort_order', ascending: true })
  const [draft, setDraft] = useState('')

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="font-display text-xl text-[var(--paper)]">Your arc</h1>
        {settings ? (
          <p className="mt-1 text-sm text-white/50">
            {settings.challenge_length}-day challenge, started {format(new Date(`${settings.start_date}T12:00:00`), 'MMM d, yyyy')}.
          </p>
        ) : (
          <p className="mt-1 text-sm text-white/50">Not started yet — pick a length on the Today page.</p>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-xl text-[var(--paper)]">Routines</h2>
        <p className="mt-1 text-sm text-white/50">The short list today's voice tracks for you.</p>

        {routines.length === 0 && <div className="mt-4"><EmptyState text="No routines yet." /></div>}

        <div className="mt-4 space-y-2">
          {routines.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
              <span className="text-[var(--paper)]">{r.name}</span>
              <Button variant="ghost" onClick={() => remove(r.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>

        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!draft.trim()) return
            insert({ name: draft.trim(), sort_order: routines.length } as Partial<Routine>)
            setDraft('')
          }}
        >
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a routine" />
          <Button type="submit" variant="secondary">
            Add
          </Button>
        </form>
      </Card>
    </div>
  )
}
