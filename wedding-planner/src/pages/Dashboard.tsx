import { useState } from 'react'
import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { useTable } from '../hooks/useTable'
import { useWeddingSettings } from '../hooks/useWeddingSettings'
import type { BudgetItem, Guest, Task, WeddingSettings, EventRow, Vendor } from '../lib/types'
import { Card, Input, PageHeader, ProgressBar, Button } from '../components/ui'
import PhotoBanner from '../components/PhotoBanner'

export default function Dashboard() {
  const { settings, save } = useWeddingSettings()
  const [editing, setEditing] = useState(false)
  const { rows: budget } = useTable<BudgetItem>('budget_items')
  const { rows: guests } = useTable<Guest>('guests')
  const { rows: tasks } = useTable<Task>('tasks')
  const { rows: events } = useTable<EventRow>('events', { column: 'event_date' })
  const { rows: vendors } = useTable<Vendor>('vendors')

  async function saveSettings(values: Partial<WeddingSettings>) {
    await save(values)
    setEditing(false)
  }

  const daysLeft = settings?.wedding_date
    ? differenceInCalendarDays(parseISO(settings.wedding_date), new Date())
    : null

  const spent = budget.reduce((s, b) => s + (b.actual_cost || 0), 0)
  const totalBudget = settings?.total_budget || 0
  const confirmedGuests = guests.filter((g) => g.rsvp_status === 'yes')
  const headcount = confirmedGuests.reduce((s, g) => s + 1 + (g.plus_one_count || 0), 0)
  const tasksDone = tasks.filter((t) => t.done).length
  const bookedVendors = vendors.filter((v) => v.status === 'booked').length

  const nextEvent = events
    .filter((e) => e.event_date && new Date(e.event_date) >= new Date(new Date().toDateString()))
    .sort((a, b) => (a.event_date! > b.event_date! ? 1 : -1))[0]

  return (
    <div>
      <PhotoBanner />

      <PageHeader
        title={
          settings?.bride_name || settings?.groom_name
            ? `${settings?.bride_name ?? ''} ${settings?.bride_name && settings?.groom_name ? '&' : ''} ${settings?.groom_name ?? ''}`.trim()
            : 'Our Wedding'
        }
        subtitle="Plan everything, from anywhere."
        action={
          <Button variant="secondary" onClick={() => setEditing((e) => !e)}>
            {editing ? 'Close' : 'Edit details'}
          </Button>
        }
      />

      {editing && (
        <Card className="mb-5">
          <SettingsForm settings={settings} onSave={saveSettings} />
        </Card>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <p className="text-xs text-stone-400">Countdown</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--accent-700)]">
            {daysLeft === null ? '—' : daysLeft >= 0 ? `${daysLeft}d` : 'Done!'}
          </p>
          <p className="text-xs text-stone-400">
            {settings?.wedding_date ? format(parseISO(settings.wedding_date), 'EEE, MMM d, yyyy') : 'Set your date'}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-stone-400">Guests confirmed</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--accent-700)]">{headcount}</p>
          <p className="text-xs text-stone-400">{guests.length} invited total</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-400">Vendors booked</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--accent-700)]">{bookedVendors}</p>
          <p className="text-xs text-stone-400">{vendors.length} total</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-400">Tasks done</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--accent-700)]">
            {tasksDone}/{tasks.length}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-2 text-sm font-semibold text-stone-600">Budget</h2>
          <p className="text-lg font-semibold">
            ₹{spent.toLocaleString('en-IN')} <span className="text-sm font-normal text-stone-400">of ₹{totalBudget.toLocaleString('en-IN')}</span>
          </p>
          <div className="mt-2">
            <ProgressBar value={totalBudget ? (spent / totalBudget) * 100 : 0} />
          </div>
        </Card>
        <Card>
          <h2 className="mb-2 text-sm font-semibold text-stone-600">Checklist progress</h2>
          <p className="text-lg font-semibold">
            {tasksDone} <span className="text-sm font-normal text-stone-400">of {tasks.length} tasks</span>
          </p>
          <div className="mt-2">
            <ProgressBar value={tasks.length ? (tasksDone / tasks.length) * 100 : 0} />
          </div>
        </Card>
      </div>

      {nextEvent && (
        <Card className="mt-4">
          <h2 className="mb-1 text-sm font-semibold text-stone-600">Next up</h2>
          <p className="text-lg font-semibold">{nextEvent.name}</p>
          <p className="text-sm text-stone-500">
            {format(parseISO(nextEvent.event_date!), 'EEE, MMM d, yyyy')}
            {nextEvent.start_time ? ` · ${nextEvent.start_time}` : ''} {nextEvent.venue ? `· ${nextEvent.venue}` : ''}
          </p>
        </Card>
      )}
    </div>
  )
}

const THEME_SWATCHES = [
  { name: 'Rose', value: '#e11d48' },
  { name: 'Maroon', value: '#9f1239' },
  { name: 'Gold', value: '#b45309' },
  { name: 'Saffron', value: '#ea580c' },
  { name: 'Magenta', value: '#a21caf' },
  { name: 'Teal', value: '#0f766e' },
  { name: 'Plum', value: '#6d28d9' },
  { name: 'Forest', value: '#15803d' },
]

function SettingsForm({
  settings,
  onSave,
}: {
  settings: WeddingSettings | null
  onSave: (v: Partial<WeddingSettings>) => void
}) {
  const [brideName, setBrideName] = useState(settings?.bride_name ?? '')
  const [groomName, setGroomName] = useState(settings?.groom_name ?? '')
  const [weddingDate, setWeddingDate] = useState(settings?.wedding_date ?? '')
  const [totalBudget, setTotalBudget] = useState(String(settings?.total_budget ?? ''))
  const [themeColor, setThemeColor] = useState(settings?.theme_color ?? '#e11d48')

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({
          bride_name: brideName,
          groom_name: groomName,
          wedding_date: weddingDate || null,
          total_budget: Number(totalBudget) || 0,
          theme_color: themeColor,
        })
      }}
    >
      <label className="text-sm text-stone-500">
        Bride's name
        <Input className="mt-1" value={brideName} onChange={(e) => setBrideName(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500">
        Groom's name
        <Input className="mt-1" value={groomName} onChange={(e) => setGroomName(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500">
        Wedding date
        <Input className="mt-1" type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500">
        Total budget (₹)
        <Input
          className="mt-1"
          type="number"
          value={totalBudget}
          onChange={(e) => setTotalBudget(e.target.value)}
        />
      </label>
      <div className="text-sm text-stone-500 md:col-span-2">
        Theme color
        <div className="mt-1 flex flex-wrap gap-2">
          {THEME_SWATCHES.map((swatch) => (
            <button
              key={swatch.value}
              type="button"
              title={swatch.name}
              onClick={() => setThemeColor(swatch.value)}
              className="h-8 w-8 rounded-full border-2 transition"
              style={{
                backgroundColor: swatch.value,
                borderColor: themeColor === swatch.value ? '#1c1917' : 'transparent',
              }}
            />
          ))}
        </div>
      </div>
      <Button type="submit" className="md:col-span-2">
        Save
      </Button>
    </form>
  )
}
