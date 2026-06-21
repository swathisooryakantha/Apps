import { useState } from 'react'
import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { useTable } from '../hooks/useTable'
import type { StoryMilestone } from '../lib/types'
import { Button, Card, EmptyState, Input, PageHeader, Textarea } from '../components/ui'

const STARTER_MILESTONES: { title: string; description?: string }[] = [
  { title: 'When we first met' },
  { title: 'When he asked me out' },
  { title: 'When our parents met' },
]

export default function OurStory() {
  const { rows, insert, update, remove } = useTable<StoryMilestone>('story_milestones', {
    column: 'milestone_date',
    ascending: true,
  })
  const [showForm, setShowForm] = useState(false)

  const sorted = [...rows].sort((a, b) => {
    if (!a.milestone_date && !b.milestone_date) return 0
    if (!a.milestone_date) return 1
    if (!b.milestone_date) return -1
    return a.milestone_date < b.milestone_date ? -1 : 1
  })

  async function seedStarterMilestones() {
    for (const m of STARTER_MILESTONES) {
      const exists = rows.some((r) => r.title.trim().toLowerCase() === m.title.trim().toLowerCase())
      if (!exists) {
        await insert({ title: m.title, description: m.description ?? null, milestone_date: null })
      }
    }
  }

  return (
    <div>
      <PageHeader
        title="Our Story"
        subtitle="The moments that led here."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={seedStarterMilestones}>
              Load starter moments
            </Button>
            <Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ Add moment'}</Button>
          </div>
        }
      />

      {showForm && (
        <Card className="mb-4">
          <MilestoneForm
            onSave={(values) => {
              insert(values)
              setShowForm(false)
            }}
          />
        </Card>
      )}

      {rows.length === 0 && <EmptyState text="No moments yet — add when you first met, your first date, and more." />}

      <div className="space-y-2">
        {sorted.map((m) => (
          <MilestoneRow key={m.id} milestone={m} onUpdate={update} onRemove={remove} />
        ))}
      </div>
    </div>
  )
}

function daysSince(dateStr: string): number {
  return differenceInCalendarDays(new Date(new Date().toDateString()), parseISO(dateStr))
}

function MilestoneRow({
  milestone,
  onUpdate,
  onRemove,
}: {
  milestone: StoryMilestone
  onUpdate: (id: string, v: Partial<StoryMilestone>) => void
  onRemove: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <Card>
        <MilestoneForm
          initial={milestone}
          onSave={(values) => {
            onUpdate(milestone.id, values)
            setEditing(false)
          }}
        />
        <Button variant="secondary" className="mt-2" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </Card>
    )
  }

  const days = milestone.milestone_date ? daysSince(milestone.milestone_date) : null

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-medium text-stone-800">{milestone.title}</p>
        <p className="text-xs text-stone-400">
          {milestone.milestone_date ? format(parseISO(milestone.milestone_date), 'EEE, MMM d, yyyy') : 'No date set'}
        </p>
        {milestone.description && <p className="mt-1 text-sm text-stone-600">{milestone.description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {days !== null && (
          <div className="text-right">
            <p className="text-lg font-semibold text-[var(--accent-700)]">{days.toLocaleString('en-IN')}</p>
            <p className="text-xs text-stone-400">days ago</p>
          </div>
        )}
        <Button variant="secondary" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <Button variant="danger" onClick={() => onRemove(milestone.id)}>
          Delete
        </Button>
      </div>
    </Card>
  )
}

function MilestoneForm({
  initial,
  onSave,
}: {
  initial?: StoryMilestone
  onSave: (v: Partial<StoryMilestone>) => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [milestoneDate, setMilestoneDate] = useState(initial?.milestone_date ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ title, milestone_date: milestoneDate || null, description: description || null })
      }}
    >
      <label className="text-sm text-stone-500">
        Moment
        <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Our first date" />
      </label>
      <label className="text-sm text-stone-500">
        Date
        <Input className="mt-1" type="date" value={milestoneDate} onChange={(e) => setMilestoneDate(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500 md:col-span-2">
        Notes (optional)
        <Textarea className="mt-1" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </label>
      <Button type="submit" className="md:col-span-2">
        Save moment
      </Button>
    </form>
  )
}
