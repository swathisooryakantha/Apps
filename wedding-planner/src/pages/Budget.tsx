import { useState } from 'react'
import { useTable } from '../hooks/useTable'
import type { BudgetItem } from '../lib/types'
import { Button, Card, EmptyState, Input, PageHeader, ProgressBar, Textarea } from '../components/ui'

const CATEGORIES = ['Venue', 'Catering', 'Attire', 'Jewelry', 'Photography', 'Decor', 'Priest & Rituals', 'Invitations', 'Gifts', 'Other']

export default function Budget() {
  const { rows, insert, update, remove } = useTable<BudgetItem>('budget_items')
  const [showForm, setShowForm] = useState(false)

  const topLevel = rows.filter((r) => !r.parent_id)
  const totalEstimated = topLevel.reduce((s, r) => s + totals(r, rows).estimated, 0)
  const totalActual = topLevel.reduce((s, r) => s + totals(r, rows).actual, 0)

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

      {topLevel.length === 0 && <EmptyState text="No budget items yet." />}

      <div className="space-y-2">
        {topLevel.map((item) => (
          <BudgetRow key={item.id} item={item} allItems={rows} onUpdate={update} onRemove={remove} onInsert={insert} />
        ))}
      </div>
    </div>
  )
}

function totals(item: BudgetItem, allItems: BudgetItem[]): { estimated: number; actual: number } {
  const children = allItems.filter((i) => i.parent_id === item.id)
  const childActual = children.reduce((sum, c) => sum + totals(c, allItems).actual, 0)
  return { estimated: item.estimated_cost, actual: item.actual_cost + childActual }
}

function BudgetRow({
  item,
  allItems,
  onUpdate,
  onRemove,
  onInsert,
}: {
  item: BudgetItem
  allItems: BudgetItem[]
  onUpdate: (id: string, v: Partial<BudgetItem>) => void
  onRemove: (id: string) => void
  onInsert: (v: Partial<BudgetItem>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [addingSub, setAddingSub] = useState(false)

  const children = allItems.filter((i) => i.parent_id === item.id)
  const hasChildren = children.length > 0
  const { estimated, actual } = totals(item, allItems)
  const pct = estimated ? Math.min(100, (actual / estimated) * 100) : 0

  if (editing) {
    return (
      <Card>
        <BudgetForm
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
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          {hasChildren && (
            <button onClick={() => setExpanded((e) => !e)} className="text-stone-400">
              {expanded ? '▾' : '▸'}
            </button>
          )}
          <div>
            <p className="font-medium text-stone-800">{item.item_name}</p>
            <p className="text-xs text-stone-400">{item.category}</p>
            {item.notes && <p className="text-xs text-stone-400">{item.notes}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <p className="text-stone-400">Est. ₹{estimated.toLocaleString('en-IN')}</p>
            <p className="font-medium text-stone-700">Actual ₹{actual.toLocaleString('en-IN')}</p>
          </div>
          {!hasChildren && (
            <label className="flex items-center gap-1 text-xs text-stone-500">
              <input
                type="checkbox"
                checked={item.paid}
                onChange={(e) => onUpdate(item.id, { paid: e.target.checked })}
              />
              Paid
            </label>
          )}
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => onRemove(item.id)}>
            Delete
          </Button>
        </div>
      </div>

      {hasChildren && (
        <div className="mt-2">
          <ProgressBar value={pct} />
        </div>
      )}

      {expanded && hasChildren && (
        <div className="mt-3 ml-5 space-y-2 border-l border-rose-100 pl-3">
          {children.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-stone-700">{c.item_name}</p>
                {c.notes && <p className="text-xs text-stone-400">{c.notes}</p>}
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-stone-400">Paid ₹{c.actual_cost.toLocaleString('en-IN')}</span>
                <label className="flex items-center gap-1 text-stone-500">
                  <input type="checkbox" checked={c.paid} onChange={(e) => onUpdate(c.id, { paid: e.target.checked })} />
                  Paid
                </label>
                <SubEditButton item={c} onUpdate={onUpdate} />
                <button onClick={() => onRemove(c.id)} className="text-stone-300 hover:text-red-500">
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={hasChildren ? 'mt-2 ml-5' : 'mt-2'}>
        {addingSub ? (
          <BudgetForm
            compact
            initial={{ category: item.category } as BudgetItem}
            onSave={(values) => {
              onInsert({ ...values, parent_id: item.id })
              setAddingSub(false)
              setExpanded(true)
            }}
          />
        ) : (
          <button onClick={() => setAddingSub(true)} className="text-xs font-medium text-rose-500 hover:underline">
            + Add sub-expense
          </button>
        )}
      </div>
    </Card>
  )
}

function SubEditButton({ item, onUpdate }: { item: BudgetItem; onUpdate: (id: string, v: Partial<BudgetItem>) => void }) {
  const [editing, setEditing] = useState(false)

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="text-rose-500 hover:underline">
        Edit
      </button>
    )
  }

  return (
    <div className="absolute z-10 mt-2 w-72 rounded-xl border border-rose-100 bg-white p-3 shadow-lg">
      <BudgetForm
        compact
        initial={item}
        onSave={(values) => {
          onUpdate(item.id, values)
          setEditing(false)
        }}
      />
    </div>
  )
}

function BudgetForm({
  initial,
  onSave,
  compact = false,
}: {
  initial?: BudgetItem
  onSave: (v: Partial<BudgetItem>) => void
  compact?: boolean
}) {
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0])
  const [itemName, setItemName] = useState(initial?.item_name ?? '')
  const [estimated, setEstimated] = useState(String(initial?.estimated_cost ?? ''))
  const [actual, setActual] = useState(String(initial?.actual_cost ?? ''))
  const [notes, setNotes] = useState(initial?.notes ?? '')

  return (
    <form
      className={compact ? 'grid gap-2' : 'grid gap-3 md:grid-cols-2'}
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
      {!compact && (
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
      )}
      <label className="text-sm text-stone-500">
        {compact ? 'Payment name' : 'Item name'}
        <Input className="mt-1" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
      </label>
      {!compact && (
        <label className="text-sm text-stone-500">
          Estimated cost (₹)
          <Input className="mt-1" type="number" value={estimated} onChange={(e) => setEstimated(e.target.value)} />
        </label>
      )}
      <label className="text-sm text-stone-500">
        {compact ? 'Amount paid (₹)' : 'Actual cost (₹)'}
        <Input className="mt-1" type="number" value={actual} onChange={(e) => setActual(e.target.value)} />
      </label>
      <label className={`text-sm text-stone-500 ${compact ? '' : 'md:col-span-2'}`}>
        Notes
        <Textarea className="mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </label>
      <Button type="submit" className={compact ? '' : 'md:col-span-2'}>
        Save
      </Button>
    </form>
  )
}
