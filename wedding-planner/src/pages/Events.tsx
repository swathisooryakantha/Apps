import { useState } from 'react'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { useTable } from '../hooks/useTable'
import type { EventRow } from '../lib/types'
import { Button, Card, EmptyState, Input, PageHeader, Textarea } from '../components/ui'

const PRESETS = ['Engagement', 'Muhurtham', 'Reception', 'Sangeet', 'Haldi', 'Mehendi']

export default function Events() {
  const { rows, insert, update, remove } = useTable<EventRow>('events', { column: 'event_date' })
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="All your ceremonies and functions, in order."
        action={<Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ Add event'}</Button>}
      />

      {showForm && (
        <Card className="mb-4">
          <EventForm
            onSave={(values) => {
              insert(values)
              setShowForm(false)
            }}
          />
        </Card>
      )}

      {rows.length === 0 && <EmptyState text="No events yet. Add your first ceremony above." />}

      <div className="space-y-3">
        {rows.map((event) => (
          <EventCard key={event.id} event={event} onUpdate={update} onRemove={remove} />
        ))}
      </div>
    </div>
  )
}

function EventCard({
  event,
  onUpdate,
  onRemove,
}: {
  event: EventRow
  onUpdate: (id: string, v: Partial<EventRow>) => void
  onRemove: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)

  const past = event.event_date ? isPast(parseISO(event.event_date)) && !isToday(parseISO(event.event_date)) : false

  if (editing) {
    return (
      <Card>
        <EventForm
          initial={event}
          onSave={(values) => {
            onUpdate(event.id, values)
            setEditing(false)
          }}
        />
      </Card>
    )
  }

  return (
    <Card className={`flex items-start justify-between gap-3 ${past ? 'opacity-50' : ''}`}>
      <div>
        <div className="flex items-center gap-2">
          <p className={`font-semibold ${past ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{event.name}</p>
          {past && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-400">Done</span>}
          {isToday(parseISO(event.event_date ?? '9999-01-01')) && (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">Today!</span>
          )}
        </div>
        <p className="text-sm text-stone-500">
          {event.event_date ? format(parseISO(event.event_date), 'EEE, MMM d, yyyy') : 'No date set'}
          {event.start_time ? ` · ${event.start_time}${event.end_time ? `–${event.end_time}` : ''}` : ''}
        </p>
        {event.venue && <p className="text-sm text-stone-500">📍 {event.venue}</p>}
        {event.notes && <p className="mt-1 text-sm text-stone-400">{event.notes}</p>}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="secondary" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <Button variant="danger" onClick={() => onRemove(event.id)}>
          Delete
        </Button>
      </div>
    </Card>
  )
}

function EventForm({ initial, onSave }: { initial?: EventRow; onSave: (v: Partial<EventRow>) => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [eventDate, setEventDate] = useState(initial?.event_date ?? '')
  const [startTime, setStartTime] = useState(initial?.start_time ?? '')
  const [endTime, setEndTime] = useState(initial?.end_time ?? '')
  const [venue, setVenue] = useState(initial?.venue ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({
          name,
          event_date: eventDate || null,
          start_time: startTime || null,
          end_time: endTime || null,
          venue,
          notes,
        })
      }}
    >
      <label className="text-sm text-stone-500 md:col-span-2">
        Event name
        <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="mt-1 flex flex-wrap gap-1">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setName(p)}
              className="rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-600 hover:bg-rose-100"
            >
              {p}
            </button>
          ))}
        </div>
      </label>
      <label className="text-sm text-stone-500">
        Date
        <Input className="mt-1" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500">
        Venue
        <Input className="mt-1" value={venue} onChange={(e) => setVenue(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500">
        Start time
        <Input className="mt-1" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500">
        End time
        <Input className="mt-1" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500 md:col-span-2">
        Notes
        <Textarea className="mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </label>
      <Button type="submit" className="md:col-span-2">
        Save event
      </Button>
    </form>
  )
}
