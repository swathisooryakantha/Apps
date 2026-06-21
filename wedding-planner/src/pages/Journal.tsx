import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useTable } from '../hooks/useTable'
import type { JournalPerson, MoodEntry } from '../lib/types'
import { Button, Card, EmptyState, PageHeader, Select, Textarea } from '../components/ui'

const MOODS: { name: string; emoji: string; quotes: string[] }[] = [
  {
    name: 'Excited',
    emoji: '🤩',
    quotes: [
      'Every day is one day closer to forever.',
      "Butterflies are just love getting ready to fly.",
      'Counting down with a heart full of joy.',
    ],
  },
  {
    name: 'Happy',
    emoji: '😄',
    quotes: ['Happiness looks gorgeous on you.', 'A happy heart makes the best memories.', 'Joy shared is joy doubled.'],
  },
  {
    name: 'Loved',
    emoji: '🥰',
    quotes: [
      'Being loved fully is the best feeling in the world.',
      'Love multiplies the moment it is shared.',
      'In your love, I have found my home.',
    ],
  },
  {
    name: 'Grateful',
    emoji: '🙏',
    quotes: [
      'Grateful for this journey and the people on it.',
      'Counting blessings, not just days.',
      'Gratitude turns what we have into enough.',
    ],
  },
  {
    name: 'Nervous',
    emoji: '😬',
    quotes: ["It's okay to feel nervous — it means it matters.", 'Butterflies before big things are normal.', "Breathe. You've got this."],
  },
  {
    name: 'Stressed',
    emoji: '😩',
    quotes: [
      'This too shall pass — and the wedding will be beautiful.',
      'One step at a time gets the whole list done.',
      'Stress is temporary, the memories are forever.',
    ],
  },
  {
    name: 'Tired',
    emoji: '🥱',
    quotes: ['Rest today so you can celebrate fully tomorrow.', 'Even the best plans need a nap.', 'Tired hands, happy heart.'],
  },
  {
    name: 'Romantic',
    emoji: '💕',
    quotes: [
      'Every love story is beautiful, but ours is my favorite.',
      'With you, every day feels like a love song.',
      'Falling for you a little more each day.',
    ],
  },
  {
    name: 'Peaceful',
    emoji: '😌',
    quotes: ['Calm mind, happy heart, beautiful beginning.', 'Peace is choosing love over worry.', 'Stillness before the celebration.'],
  },
  {
    name: 'Overwhelmed',
    emoji: '🌀',
    quotes: ["It's a lot — and you're handling it beautifully.", 'Big things feel big. That is okay.', 'One task at a time, one breath at a time.'],
  },
]

const PERSON_LABELS: Record<JournalPerson, string> = { bride: 'Bride', groom: 'Groom' }
const PERSON_STYLES: Record<JournalPerson, string> = {
  bride: 'bg-rose-100 text-rose-700',
  groom: 'bg-sky-100 text-sky-700',
}

function moodInfo(mood: string) {
  return MOODS.find((m) => m.name === mood)
}

function randomQuote(mood: string): string {
  const quotes = moodInfo(mood)?.quotes ?? []
  return quotes[Math.floor(Math.random() * quotes.length)] ?? ''
}

export default function Journal() {
  const { rows, insert, update, remove } = useTable<MoodEntry>('mood_entries', { column: 'entry_date', ascending: false })
  const [showForm, setShowForm] = useState(false)

  const dates = [...new Set(rows.map((r) => r.entry_date))].sort((a, b) => (a < b ? 1 : -1))

  return (
    <div>
      <PageHeader
        title="Mood Journal"
        subtitle="A little wedding journal — how you're both feeling, day by day."
        action={<Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ Add entry'}</Button>}
      />

      {showForm && (
        <Card className="mb-4">
          <EntryForm
            onSave={(values) => {
              insert(values)
              setShowForm(false)
            }}
          />
        </Card>
      )}

      {rows.length === 0 && <EmptyState text="No journal entries yet — log how you're each feeling today." />}

      <div className="space-y-5">
        {dates.map((date) => (
          <div key={date}>
            <h2 className="mb-2 text-sm font-semibold text-stone-500">{format(parseISO(date), 'EEE, MMM d, yyyy')}</h2>
            <div className="space-y-2">
              {rows
                .filter((r) => r.entry_date === date)
                .map((entry) => <EntryRow key={entry.id} entry={entry} onUpdate={update} onRemove={remove} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EntryRow({
  entry,
  onUpdate,
  onRemove,
}: {
  entry: MoodEntry
  onUpdate: (id: string, v: Partial<MoodEntry>) => void
  onRemove: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const info = moodInfo(entry.mood)

  if (editing) {
    return (
      <Card>
        <EntryForm
          initial={entry}
          onSave={(values) => {
            onUpdate(entry.id, values)
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
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-1 items-start gap-3">
          <span className="text-2xl">{info?.emoji ?? '💭'}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PERSON_STYLES[entry.person]}`}>
                {PERSON_LABELS[entry.person]}
              </span>
              <span className="text-sm font-medium text-stone-700">{entry.mood}</span>
            </div>
            {entry.quote && <p className="mt-1 text-sm italic text-stone-500">&ldquo;{entry.quote}&rdquo;</p>}
            {entry.note && <p className="mt-1 text-sm text-stone-600">{entry.note}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => onRemove(entry.id)}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  )
}

function EntryForm({ initial, onSave }: { initial?: MoodEntry; onSave: (v: Partial<MoodEntry>) => void }) {
  const [person, setPerson] = useState<JournalPerson>(initial?.person ?? 'bride')
  const [entryDate, setEntryDate] = useState(initial?.entry_date ?? format(new Date(), 'yyyy-MM-dd'))
  const [mood, setMood] = useState(initial?.mood ?? MOODS[0].name)
  const [note, setNote] = useState(initial?.note ?? '')

  return (
    <form
      className="grid gap-3 md:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault()
        const quote = initial && initial.mood === mood && initial.quote ? initial.quote : randomQuote(mood)
        onSave({ person, entry_date: entryDate, mood, quote, note: note || null })
      }}
    >
      <label className="text-sm text-stone-500">
        Who
        <Select className="mt-1" value={person} onChange={(e) => setPerson(e.target.value as JournalPerson)}>
          <option value="bride">Bride</option>
          <option value="groom">Groom</option>
        </Select>
      </label>
      <label className="text-sm text-stone-500">
        Date
        <input
          type="date"
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-[var(--accent-400)]"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
        />
      </label>
      <label className="text-sm text-stone-500">
        Mood
        <Select className="mt-1" value={mood} onChange={(e) => setMood(e.target.value)}>
          {MOODS.map((m) => (
            <option key={m.name} value={m.name}>
              {m.emoji} {m.name}
            </option>
          ))}
        </Select>
      </label>
      <label className="text-sm text-stone-500 md:col-span-3">
        Note (optional)
        <Textarea className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="What's on your mind today?" />
      </label>
      <Button type="submit" className="md:col-span-3">
        Save entry
      </Button>
    </form>
  )
}
