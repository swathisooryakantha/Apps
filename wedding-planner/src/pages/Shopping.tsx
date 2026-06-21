import { useState } from 'react'
import { useTable } from '../hooks/useTable'
import type { ShoppingItem, ShoppingStatus } from '../lib/types'
import { Button, Card, EmptyState, Input, PageHeader, Select, Textarea } from '../components/ui'

const CATEGORIES = ['Sarees', 'Blouses', 'Jewelry', 'Groom Attire', 'Footwear', 'Invitations', 'Return Gifts', 'Beauty/Makeup Trial', 'Other']

const STATUS_STYLES: Record<ShoppingStatus, string> = {
  to_do: 'bg-stone-100 text-stone-500',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-emerald-100 text-emerald-700',
}

const STATUS_LABELS: Record<ShoppingStatus, string> = {
  to_do: 'To-do',
  in_progress: 'In progress',
  done: 'Done',
}

export default function Shopping() {
  const { rows, insert, update, remove } = useTable<ShoppingItem>('shopping_items')
  const [showForm, setShowForm] = useState(false)

  const totalCost = rows.reduce((s, r) => s + (r.cost || 0), 0)

  return (
    <div>
      <PageHeader
        title="Shopping & Prep"
        subtitle={`${rows.filter((r) => r.status === 'done').length}/${rows.length} done · ₹${totalCost.toLocaleString('en-IN')} spent`}
        action={<Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ Add item'}</Button>}
      />

      {showForm && (
        <Card className="mb-4">
          <ShoppingForm
            onSave={(values) => {
              insert(values)
              setShowForm(false)
            }}
          />
        </Card>
      )}

      {rows.length === 0 && <EmptyState text="No shopping items yet — saree shopping, blouse stitching, jewelry, and more go here." />}

      <div className="space-y-2">
        {rows.map((item) => (
          <ShoppingRow key={item.id} item={item} onUpdate={update} onRemove={remove} />
        ))}
      </div>
    </div>
  )
}

function ShoppingRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: ShoppingItem
  onUpdate: (id: string, v: Partial<ShoppingItem>) => void
  onRemove: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <Card>
        <ShoppingForm
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
    <Card className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-medium text-stone-800">{item.item_name}</p>
        <p className="text-xs text-stone-400">
          {item.category} {item.store_or_vendor && `· ${item.store_or_vendor}`}{' '}
          {item.due_date && `· due ${item.due_date}`}
        </p>
        {item.cost != null && <p className="text-xs text-stone-400">₹{item.cost.toLocaleString('en-IN')}</p>}
        {item.notes && <p className="text-xs text-stone-400">{item.notes}</p>}
      </div>
      <div className="flex items-center gap-2">
        <select
          value={item.status}
          onChange={(e) => onUpdate(item.id, { status: e.target.value as ShoppingStatus })}
          className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[item.status]}`}
        >
          <option value="to_do">{STATUS_LABELS.to_do}</option>
          <option value="in_progress">{STATUS_LABELS.in_progress}</option>
          <option value="done">{STATUS_LABELS.done}</option>
        </select>
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

function ShoppingForm({ initial, onSave }: { initial?: ShoppingItem; onSave: (v: Partial<ShoppingItem>) => void }) {
  const [itemName, setItemName] = useState(initial?.item_name ?? '')
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0])
  const [store, setStore] = useState(initial?.store_or_vendor ?? '')
  const [cost, setCost] = useState(String(initial?.cost ?? ''))
  const [dueDate, setDueDate] = useState(initial?.due_date ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({
          item_name: itemName,
          category,
          store_or_vendor: store,
          cost: cost ? Number(cost) : null,
          due_date: dueDate || null,
          notes,
          status: initial?.status ?? 'to_do',
        })
      }}
    >
      <label className="text-sm text-stone-500">
        Item (e.g. Bridal saree, Reception blouse)
        <Input className="mt-1" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
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
        Store / vendor
        <Input className="mt-1" value={store} onChange={(e) => setStore(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500">
        Cost (₹)
        <Input className="mt-1" type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500">
        Due date
        <Input className="mt-1" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500 md:col-span-2">
        Notes
        <Textarea className="mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </label>
      <Button type="submit" className="md:col-span-2">
        Save item
      </Button>
    </form>
  )
}
