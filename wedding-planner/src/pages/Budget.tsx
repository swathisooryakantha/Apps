import { useState } from 'react'
import { useTable } from '../hooks/useTable'
import type { BudgetItem } from '../lib/types'
import { Button, Card, EmptyState, Input, PageHeader, Textarea } from '../components/ui'

const CATEGORIES = ['Venue', 'Catering', 'Attire', 'Jewelry', 'Photography', 'Decor', 'Priest & Rituals', 'Invitations', 'Gifts', 'Other']

export default function Budget() {
  const { rows, insert, update, remove } = useTable<BudgetItem>('budget_items')
  const [showForm, setShowForm] = useState(false)

  const totalEstimated = rows.reduce((s, r) => s + (r.estimated_cost || 0), 0)
  const totalActual = rows.reduce((s, r) => s + (r.actual_cost || 0), 0)

  return (
    <div>
      <PageHeader
        title="Budget"
        subtitle={`Estimated ₹${totalEstimated.toLocaleString('en-IN')} · Actual ₹${totalActual.toLocaleString('en-IN')}`}
        action={<Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ Add expense'}</Button>}
      />

      {showForm && (
        <Card className="mb-4">
          <BudgetForm
            onSave={(values) => {
              insert(values)
              setShowForm(false)
            }}
          />
        </Card>
      )}

      {rows.length === 0 && <EmptyState text="No budget items yet." />}

      <div className="space-y-2">
        {rows.map((item) => (
          <Card key={item.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-stone-800">{item.item_name}</p>
              <p className="text-xs text-stone-400">{item.category}</p>
              {item.notes && <p className="text-xs text-stone-400">{item.notes}</p>}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <p className="text-stone-400">Est. ₹{item.estimated_cost.toLocaleString('en-IN')}</p>
                <p className="font-medium text-stone-700">Actual ₹{item.actual_cost.toLocaleString('en-IN')}</p>
              </div>
              <label className="flex items-center gap-1 text-xs text-stone-500">
                <input
                  type="checkbox"
                  checked={item.paid}
                  onChange={(e) => update(item.id, { paid: e.target.checked })}
                />
                Paid
              </label>
              <Button variant="danger" onClick={() => remove(item.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function BudgetForm({ onSave }: { onSave: (v: Partial<BudgetItem>) => void }) {
  const [category, setCategory] = useState(CATEGORIES[0])
  const [itemName, setItemName] = useState('')
  const [estimated, setEstimated] = useState('')
  const [actual, setActual] = useState('')
  const [notes, setNotes] = useState('')

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({
          category,
          item_name: itemName,
          estimated_cost: Number(estimated) || 0,
          actual_cost: Number(actual) || 0,
          notes,
        })
      }}
    >
      <label className="text-sm text-stone-500">
        Category
        <select
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-rose-400"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="text-sm text-stone-500">
        Item name
        <Input className="mt-1" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
      </label>
      <label className="text-sm text-stone-500">
        Estimated cost (₹)
        <Input className="mt-1" type="number" value={estimated} onChange={(e) => setEstimated(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500">
        Actual cost (₹)
        <Input className="mt-1" type="number" value={actual} onChange={(e) => setActual(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500 md:col-span-2">
        Notes
        <Textarea className="mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </label>
      <Button type="submit" className="md:col-span-2">
        Save expense
      </Button>
    </form>
  )
}
