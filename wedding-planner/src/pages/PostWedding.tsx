import { useState } from 'react'
import { useTable } from '../hooks/useTable'
import type { PostWeddingItem } from '../lib/types'
import { Button, Card, EmptyState, Input, PageHeader, ProgressBar, Select } from '../components/ui'

const CATEGORIES = ['Home', 'Appliances', 'Furniture & Decor', 'Documents & Admin', 'Celebrations', 'Other']

const OWNER_PRESETS = ['Me', 'Partner', 'Mom', 'Dad', 'Sister', 'Brother', 'Cousin', 'Other']

const OWNER_STYLES = 'bg-violet-100 text-violet-700'

const STARTER_ITEMS: { title: string; category: string; subtasks?: string[] }[] = [
  { title: 'Decide where to set up home (rent / buy)', category: 'Home' },
  {
    title: 'Set up new home',
    category: 'Home',
    subtasks: ['Sign rental/sale agreement', 'Utilities & internet setup', 'Basic furniture (bed, sofa, dining)', 'Curtains & interiors'],
  },
  {
    title: 'Buy major appliances',
    category: 'Appliances',
    subtasks: ['Refrigerator', 'Washing machine', 'TV', 'Kitchen appliances (mixer, stove, etc.)', 'AC / fans'],
  },
  { title: 'Buy kitchen & home essentials (cookware, utensils, linens)', category: 'Furniture & Decor' },
  { title: 'Update address on documents (ID, bank, etc.)', category: 'Documents & Admin' },
  { title: 'Update bank accounts & nominee details', category: 'Documents & Admin' },
  { title: 'Plan housewarming function', category: 'Celebrations' },
]

export default function PostWedding() {
  const { rows, insert, update, remove } = useTable<PostWeddingItem>('post_wedding_items')
  const [showForm, setShowForm] = useState(false)

  const topLevel = rows.filter((t) => !t.parent_id)
  const grouped = CATEGORIES.map((c) => ({ c, items: topLevel.filter((t) => t.category === c) })).filter(
    (g) => g.items.length > 0,
  )
  const uncategorized = topLevel.filter((t) => !t.category)
  const done = topLevel.filter((t) => isItemDone(t, rows)).length
  const totalCost = rows.reduce((s, r) => s + (r.cost || 0), 0)

  async function seedStarterItems() {
    for (const t of STARTER_ITEMS) {
      let parent = topLevel.find((r) => r.title.trim().toLowerCase() === t.title.trim().toLowerCase())
      if (!parent) {
        parent = (await insert({ title: t.title, category: t.category, done: false })) ?? undefined
      }
      if (t.subtasks && parent) {
        const existingChildren = rows.filter((r) => r.parent_id === parent!.id)
        for (const sub of t.subtasks) {
          const exists = existingChildren.some((c) => c.title.trim().toLowerCase() === sub.trim().toLowerCase())
          if (!exists) {
            await insert({ title: sub, parent_id: parent.id, done: false })
          }
        }
      }
    }
  }

  return (
    <div>
      <PageHeader
        title="Post-Wedding Setup"
        subtitle={`${done} of ${topLevel.length} done · ₹${totalCost.toLocaleString('en-IN')} spent`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={seedStarterItems}>Load starter checklist</Button>
            <Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ Add item'}</Button>
          </div>
        }
      />

      {showForm && (
        <Card className="mb-4">
          <ItemForm
            onSave={(values) => {
              insert(values)
              setShowForm(false)
            }}
          />
        </Card>
      )}

      {rows.length === 0 && (
        <EmptyState text="Nothing here yet — track setting up your new home, buying appliances, and other post-wedding to-dos." />
      )}

      <div className="space-y-5">
        {grouped.map(({ c, items }) => (
          <div key={c}>
            <h2 className="mb-2 text-sm font-semibold text-stone-500">{c}</h2>
            <div className="space-y-2">
              {items.map((t) => (
                <ItemRow key={t.id} item={t} allItems={rows} onUpdate={update} onRemove={remove} onInsert={insert} />
              ))}
            </div>
          </div>
        ))}
        {uncategorized.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-semibold text-stone-500">Other</h2>
            <div className="space-y-2">
              {uncategorized.map((t) => (
                <ItemRow key={t.id} item={t} allItems={rows} onUpdate={update} onRemove={remove} onInsert={insert} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function isItemDone(item: PostWeddingItem, allItems: PostWeddingItem[]): boolean {
  const children = allItems.filter((t) => t.parent_id === item.id)
  if (children.length === 0) return item.done
  return children.every((c) => c.done)
}

function ItemRow({
  item,
  allItems,
  onUpdate,
  onRemove,
  onInsert,
}: {
  item: PostWeddingItem
  allItems: PostWeddingItem[]
  onUpdate: (id: string, v: Partial<PostWeddingItem>) => void
  onRemove: (id: string) => void
  onInsert: (v: Partial<PostWeddingItem>) => Promise<PostWeddingItem | null>
}) {
  const [editing, setEditing] = useState(false)
  const [editingOwner, setEditingOwner] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [addingSubtask, setAddingSubtask] = useState(false)
  const [subtaskTitle, setSubtaskTitle] = useState('')

  const children = allItems.filter((t) => t.parent_id === item.id)
  const hasSubtasks = children.length > 0
  const doneCount = children.filter((c) => c.done).length
  const pct = hasSubtasks ? (doneCount / children.length) * 100 : 0
  const complete = hasSubtasks ? pct === 100 : item.done

  if (editing) {
    return (
      <Card className="py-3">
        <ItemForm
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
    <Card className="py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          {!hasSubtasks && (
            <input
              type="checkbox"
              checked={item.done}
              onChange={(e) => onUpdate(item.id, { done: e.target.checked })}
              className="size-4"
            />
          )}
          {hasSubtasks && (
            <button onClick={() => setExpanded((e) => !e)} className="text-stone-400">
              {expanded ? '▾' : '▸'}
            </button>
          )}
          <span className={complete ? 'text-stone-400 line-through' : 'text-stone-800'}>
            {item.title} {complete && hasSubtasks && '🎉'}
          </span>
          {item.cost != null && <span className="shrink-0 text-xs text-stone-400">₹{item.cost.toLocaleString('en-IN')}</span>}
        </div>

        {editingOwner ? (
          <OwnerPicker
            value={item.owner}
            onChange={(owner) => {
              onUpdate(item.id, { owner })
              setEditingOwner(false)
            }}
            onClose={() => setEditingOwner(false)}
          />
        ) : (
          <button
            onClick={() => setEditingOwner(true)}
            className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
              item.owner ? OWNER_STYLES : 'bg-stone-100 text-stone-400'
            }`}
          >
            {item.owner || '+ Owner'}
          </button>
        )}

        <Button variant="secondary" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <Button variant="danger" onClick={() => onRemove(item.id)}>
          Delete
        </Button>
      </div>

      {hasSubtasks && (
        <div className="mt-2 flex items-center gap-2">
          <ProgressBar value={pct} />
          <span className="w-12 shrink-0 text-right text-xs text-stone-400">
            {doneCount}/{children.length}
          </span>
        </div>
      )}

      {expanded && hasSubtasks && (
        <div className="mt-3 ml-6 space-y-1.5 border-l border-rose-100 pl-3">
          {children.map((c) => (
            <SubtaskRow key={c.id} subtask={c} onUpdate={onUpdate} onRemove={onRemove} />
          ))}
        </div>
      )}

      {(expanded || !hasSubtasks) && (
        <div className="mt-2 ml-6">
          {addingSubtask ? (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (subtaskTitle.trim()) {
                  onInsert({ title: subtaskTitle.trim(), parent_id: item.id, done: false })
                  setSubtaskTitle('')
                }
                setAddingSubtask(false)
                setExpanded(true)
              }}
            >
              <Input
                autoFocus
                className="text-sm"
                placeholder="Subtask name"
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                onBlur={() => !subtaskTitle && setAddingSubtask(false)}
              />
              <Button type="submit">Add</Button>
            </form>
          ) : (
            <button onClick={() => setAddingSubtask(true)} className="text-xs font-medium text-rose-500 hover:underline">
              + Add subtask
            </button>
          )}
        </div>
      )}
    </Card>
  )
}

function SubtaskRow({
  subtask,
  onUpdate,
  onRemove,
}: {
  subtask: PostWeddingItem
  onUpdate: (id: string, v: Partial<PostWeddingItem>) => void
  onRemove: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(subtask.title)

  if (editing) {
    return (
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (title.trim()) onUpdate(subtask.id, { title: title.trim() })
          setEditing(false)
        }}
      >
        <Input autoFocus className="text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button type="submit">Save</Button>
      </form>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <label className="flex flex-1 items-center gap-2">
        <input
          type="checkbox"
          checked={subtask.done}
          onChange={(e) => onUpdate(subtask.id, { done: e.target.checked })}
          className="size-3.5"
        />
        <span className={`text-sm ${subtask.done ? 'text-stone-400 line-through' : 'text-stone-700'}`}>{subtask.title}</span>
      </label>
      <div className="flex items-center gap-2 text-xs">
        <button onClick={() => setEditing(true)} className="text-rose-500 hover:underline">
          Edit
        </button>
        <button onClick={() => onRemove(subtask.id)} className="text-stone-300 hover:text-red-500">
          ×
        </button>
      </div>
    </div>
  )
}

function OwnerPicker({
  value,
  onChange,
  onClose,
}: {
  value: string | null
  onChange: (owner: string) => void
  onClose: () => void
}) {
  const [custom, setCustom] = useState('')

  return (
    <div className="flex shrink-0 items-center gap-1">
      <Select
        autoFocus
        className="w-32"
        defaultValue={value && OWNER_PRESETS.includes(value) ? value : value ? 'Other' : ''}
        onChange={(e) => {
          if (e.target.value === 'Other') return
          if (e.target.value) onChange(e.target.value)
          else onClose()
        }}
      >
        <option value="">— Select —</option>
        {OWNER_PRESETS.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </Select>
      <Input
        placeholder="Name"
        defaultValue={value && !OWNER_PRESETS.includes(value) ? value : ''}
        className="w-20"
        value={custom}
        onChange={(e) => setCustom(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && custom.trim()) onChange(custom.trim())
        }}
        onBlur={() => {
          if (custom.trim()) onChange(custom.trim())
        }}
      />
    </div>
  )
}

function ItemForm({ initial, onSave }: { initial?: PostWeddingItem; onSave: (v: Partial<PostWeddingItem>) => void }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0])
  const [cost, setCost] = useState(String(initial?.cost ?? ''))
  const initialOwner = initial?.owner ?? ''
  const [owner, setOwner] = useState(initialOwner && !OWNER_PRESETS.includes(initialOwner) ? 'Other' : initialOwner)
  const [customOwner, setCustomOwner] = useState(initialOwner && !OWNER_PRESETS.includes(initialOwner) ? initialOwner : '')

  return (
    <form
      className="grid gap-3 md:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault()
        const finalOwner = owner === 'Other' ? customOwner.trim() : owner
        onSave({
          title,
          category,
          cost: cost ? Number(cost) : null,
          owner: finalOwner || null,
          done: initial?.done ?? false,
        })
      }}
    >
      <label className="text-sm text-stone-500 md:col-span-2">
        Item
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
      <label className="text-sm text-stone-500">
        Cost (₹)
        <Input className="mt-1" type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500">
        Owner
        <Select className="mt-1" value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option value="">— Select —</option>
          {OWNER_PRESETS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      </label>
      {owner === 'Other' && (
        <label className="text-sm text-stone-500">
          Name
          <Input className="mt-1" value={customOwner} onChange={(e) => setCustomOwner(e.target.value)} placeholder="e.g. Aunt Priya" />
        </label>
      )}
      <Button type="submit" className="md:col-span-3">
        Save item
      </Button>
    </form>
  )
}
