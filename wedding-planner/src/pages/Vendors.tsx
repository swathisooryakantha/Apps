import { useState } from 'react'
import { useTable } from '../hooks/useTable'
import { useMoney } from '../hooks/useMoney'
import type { Vendor, VendorStatus } from '../lib/types'
import { Button, Card, EmptyState, Input, PageHeader, Select, Textarea } from '../components/ui'
import AddToBudgetButton from '../components/AddToBudgetButton'

const STATUS_STYLES: Record<VendorStatus, string> = {
  considering: 'bg-stone-100 text-stone-500',
  contacted: 'bg-amber-100 text-amber-700',
  booked: 'bg-emerald-100 text-emerald-700',
}

// Budget category a vendor's cost goes under when added to the budget.
const BUDGET_CATEGORY: Record<string, string> = {
  Venue: 'Venue',
  Catering: 'Catering',
  Photography: 'Photography',
  Decor: 'Decor',
  Priest: 'Priest & Rituals',
}

const CATEGORIES = ['Venue', 'Catering', 'Photography', 'Decor', 'Makeup & Hair', 'Mehendi Artist', 'Music/DJ', 'Priest', 'Transport', 'Other']

export default function Vendors() {
  const { money } = useMoney()
  const { rows, insert, update, remove } = useTable<Vendor>('vendors')
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle={`${rows.filter((v) => v.status === 'booked').length} booked of ${rows.length}`}
        action={<Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ Add vendor'}</Button>}
      />

      {showForm && (
        <Card className="mb-4">
          <VendorForm
            onSave={(values) => {
              insert(values)
              setShowForm(false)
            }}
          />
        </Card>
      )}

      {rows.length === 0 && <EmptyState text="No vendors added yet." />}

      <div className="space-y-2">
        {rows.map((v) => (
          <Card key={v.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-stone-800">{v.name}</p>
              <p className="text-xs text-stone-400">
                {v.category} {v.contact_name && `· ${v.contact_name}`} {v.phone && `· ${v.phone}`}
              </p>
              {v.price != null && <p className="text-xs text-stone-400">{money(v.price)}</p>}
              {v.notes && <p className="text-xs text-stone-400">{v.notes}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AddToBudgetButton
                linkedBudgetItemId={v.budget_item_id}
                category={BUDGET_CATEGORY[v.category ?? ''] ?? 'Other'}
                itemName={v.category ? `${v.name} (${v.category})` : v.name}
                amount={v.price}
                onLinked={(budget_item_id) => update(v.id, { budget_item_id })}
              />
              <select
                value={v.status}
                onChange={(e) => update(v.id, { status: e.target.value as VendorStatus })}
                className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[v.status]}`}
              >
                <option value="considering">Considering</option>
                <option value="contacted">Contacted</option>
                <option value="booked">Booked</option>
              </select>
              <Button variant="danger" onClick={() => remove(v.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function VendorForm({ onSave }: { onSave: (v: Partial<Vendor>) => void }) {
  const { symbol } = useMoney()
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({
          name,
          category,
          contact_name: contactName,
          phone,
          price: price ? Number(price) : null,
          notes,
          status: 'considering',
        })
      }}
    >
      <label className="text-sm text-stone-500">
        Vendor name
        <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
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
        Contact name
        <Input className="mt-1" value={contactName} onChange={(e) => setContactName(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500">
        Phone
        <Input className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500">
        Price ({symbol})
        <Input className="mt-1" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500 md:col-span-2">
        Notes
        <Textarea className="mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </label>
      <Button type="submit" className="md:col-span-2">
        Save vendor
      </Button>
    </form>
  )
}
