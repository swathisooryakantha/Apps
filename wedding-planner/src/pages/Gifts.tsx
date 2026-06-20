import { useState } from 'react'
import { useTable } from '../hooks/useTable'
import type { Gift } from '../lib/types'
import { Button, Card, EmptyState, Input, PageHeader, Select, Textarea } from '../components/ui'

const CATEGORIES = ['Cash', 'Jewelry', 'Kitchenware', 'Home Decor', 'Clothing', 'Electronics', 'Other']

export default function Gifts() {
  const { rows, insert, update, remove } = useTable<Gift>('gifts')
  const [showForm, setShowForm] = useState(false)

  const totalCash = rows.filter((g) => g.category === 'Cash').reduce((s, g) => s + (g.amount || 0), 0)

  return (
    <div>
      <PageHeader
        title="Gifts"
        subtitle={`${rows.length} gifts logged${totalCash ? ` · ₹${totalCash.toLocaleString('en-IN')} cash` : ''}`}
        action={<Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ Add gift'}</Button>}
      />

      {showForm && (
        <Card className="mb-4">
          <GiftForm
            onSave={(values) => {
              insert(values)
              setShowForm(false)
            }}
          />
        </Card>
      )}

      {rows.length === 0 && (
        <EmptyState text="No gifts logged yet — add them as they come in to track who gave what and plan what to buy after the wedding." />
      )}

      <div className="space-y-2">
        {rows.map((g) => (
          <Card key={g.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-stone-800">{g.giver_name}</p>
              <p className="text-xs text-stone-400">
                {g.category} {g.gift_description && `· ${g.gift_description}`} {g.relation && `· ${g.relation}`}
              </p>
              {g.amount != null && <p className="text-xs text-stone-400">₹{g.amount.toLocaleString('en-IN')}</p>}
              {g.notes && <p className="text-xs text-stone-400">{g.notes}</p>}
            </div>
            <div className="flex items-center gap-2">
              <GiftEditButton gift={g} onUpdate={update} />
              <Button variant="danger" onClick={() => remove(g.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function GiftEditButton({ gift, onUpdate }: { gift: Gift; onUpdate: (id: string, v: Partial<Gift>) => void }) {
  const [editing, setEditing] = useState(false)

  if (!editing) {
    return (
      <Button variant="secondary" onClick={() => setEditing(true)}>
        Edit
      </Button>
    )
  }

  return (
    <div className="absolute z-10 mt-2 w-72 rounded-xl border border-rose-100 bg-white p-3 shadow-lg">
      <GiftForm
        initial={gift}
        onSave={(values) => {
          onUpdate(gift.id, values)
          setEditing(false)
        }}
      />
    </div>
  )
}

function GiftForm({ initial, onSave }: { initial?: Gift; onSave: (v: Partial<Gift>) => void }) {
  const [giverName, setGiverName] = useState(initial?.giver_name ?? '')
  const [relation, setRelation] = useState(initial?.relation ?? '')
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0])
  const [giftDescription, setGiftDescription] = useState(initial?.gift_description ?? '')
  const [amount, setAmount] = useState(String(initial?.amount ?? ''))
  const [notes, setNotes] = useState(initial?.notes ?? '')

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({
          giver_name: giverName,
          relation,
          category,
          gift_description: giftDescription,
          amount: amount ? Number(amount) : null,
          notes,
        })
      }}
    >
      <label className="text-sm text-stone-500">
        Given by
        <Input className="mt-1" value={giverName} onChange={(e) => setGiverName(e.target.value)} required />
      </label>
      <label className="text-sm text-stone-500">
        Relation (e.g. Aunt, Friend)
        <Input className="mt-1" value={relation} onChange={(e) => setRelation(e.target.value)} />
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
        Gift description
        <Input
          className="mt-1"
          value={giftDescription}
          onChange={(e) => setGiftDescription(e.target.value)}
          placeholder="e.g. Dinner set"
        />
      </label>
      <label className="text-sm text-stone-500">
        Amount (₹, if cash)
        <Input className="mt-1" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500 md:col-span-2">
        Notes
        <Textarea className="mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </label>
      <Button type="submit" className="md:col-span-2">
        Save gift
      </Button>
    </form>
  )
}
