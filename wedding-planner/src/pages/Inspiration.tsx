import { useState } from 'react'
import { useTable } from '../hooks/useTable'
import type { InspirationItem } from '../lib/types'
import { Button, Card, EmptyState, Input, PageHeader, Select, Textarea } from '../components/ui'

const CATEGORIES = ['Decor', 'Photography', 'Bridal Look', 'Groom Look', 'Mehendi Design', 'Hairstyle', 'Jewelry', 'Reception Theme', 'Cake', 'Other']

function detectPlatform(url: string | null): { label: string; icon: string } | null {
  if (!url) return null
  if (/pinterest\./i.test(url)) return { label: 'Pinterest', icon: '📌' }
  if (/instagram\./i.test(url)) return { label: 'Instagram', icon: '📷' }
  return { label: 'Link', icon: '🔗' }
}

export default function Inspiration() {
  const { rows, insert, update, remove } = useTable<InspirationItem>('inspiration_items')
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? rows : rows.filter((r) => r.category === filter)

  return (
    <div>
      <PageHeader
        title="Inspiration Board"
        subtitle="Save Pinterest pins, Instagram reels, and photo ideas in one place."
        action={<Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ Add inspiration'}</Button>}
      />

      {showForm && (
        <Card className="mb-4">
          <InspirationForm
            onSave={(values) => {
              insert(values)
              setShowForm(false)
            }}
          />
        </Card>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        {['All', ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === c ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <EmptyState text="No inspiration saved yet." />}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {filtered.map((item) => (
          <InspirationCard key={item.id} item={item} onUpdate={update} onRemove={remove} />
        ))}
      </div>
    </div>
  )
}

function InspirationCard({
  item,
  onUpdate,
  onRemove,
}: {
  item: InspirationItem
  onUpdate: (id: string, v: Partial<InspirationItem>) => void
  onRemove: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const platform = detectPlatform(item.source_link)

  if (editing) {
    return (
      <Card className="col-span-2 md:col-span-1">
        <InspirationForm
          initial={item}
          onSave={(values) => {
            onUpdate(item.id, values)
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
    <Card className="flex flex-col gap-2">
      {item.image_url && <img src={item.image_url} alt={item.title} className="aspect-square w-full rounded-lg object-cover" />}
      <div>
        <p className="text-sm font-medium text-stone-800">{item.title}</p>
        <p className="text-xs text-stone-400">{item.category}</p>
      </div>
      {item.source_link && (
        <a
          href={item.source_link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:underline"
        >
          {platform?.icon} {platform?.label}
        </a>
      )}
      {item.notes && <p className="text-xs text-stone-400">{item.notes}</p>}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <Button variant="danger" onClick={() => onRemove(item.id)}>
          Delete
        </Button>
      </div>
    </Card>
  )
}

function InspirationForm({
  initial,
  onSave,
}: {
  initial?: InspirationItem
  onSave: (v: Partial<InspirationItem>) => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0])
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
  const [sourceLink, setSourceLink] = useState(initial?.source_link ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ title, category, image_url: imageUrl || null, source_link: sourceLink || null, notes })
      }}
    >
      <label className="text-sm text-stone-500">
        Title
        <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label className="text-sm text-stone-500">
        Category
        <Select className="mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </label>
      <label className="text-sm text-stone-500 md:col-span-2">
        Pinterest / Instagram link (or any reference URL)
        <Input
          className="mt-1"
          value={sourceLink}
          onChange={(e) => setSourceLink(e.target.value)}
          placeholder="https://pinterest.com/pin/... or https://instagram.com/p/..."
        />
      </label>
      <label className="text-sm text-stone-500 md:col-span-2">
        Image URL (optional, for a preview thumbnail)
        <Input className="mt-1" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
      </label>
      <label className="text-sm text-stone-500 md:col-span-2">
        Notes
        <Textarea className="mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </label>
      <Button type="submit" className="md:col-span-2">
        Save inspiration
      </Button>
    </form>
  )
}
