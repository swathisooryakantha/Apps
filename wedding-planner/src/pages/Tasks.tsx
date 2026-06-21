import { useState } from 'react'
import { useTable } from '../hooks/useTable'
import type { Task } from '../lib/types'
import { Button, Card, EmptyState, Input, PageHeader, ProgressBar, Select } from '../components/ui'

const TIMEFRAMES = ['12+ months', '6-9 months', '3-6 months', '1-2 months', 'Week of', 'Day of']

const OWNER_PRESETS = ['Me', 'Partner', 'Couple', 'Mom', 'Dad', 'Sister', 'Brother', 'Cousin', 'Other']

const OWNER_STYLES = 'bg-violet-100 text-violet-700'

const STARTER_TASKS: { title: string; timeframe: string; subtasks?: string[] }[] = [
  { title: 'Fix wedding date with priest / panchangam', timeframe: '12+ months' },
  { title: 'Set overall wedding budget', timeframe: '12+ months' },
  { title: 'Book muhurtham & reception venues', timeframe: '12+ months' },
  { title: 'Draft initial guest list', timeframe: '12+ months' },
  { title: 'Shortlist & book wedding planner/coordinator', timeframe: '12+ months' },

  { title: 'Finalize guest list', timeframe: '6-9 months' },
  {
    title: 'Book photographer & videographer',
    timeframe: '6-9 months',
    subtasks: ['Pre-wedding shoot', 'Wedding day coverage', 'Drone/cinematic add-on'],
  },
  { title: 'Book catering (veg/non-veg menu)', timeframe: '6-9 months' },
  { title: 'Saree & blouse shopping', timeframe: '6-9 months' },
  {
    title: 'Jewellery shopping',
    timeframe: '6-9 months',
    subtasks: ['Ring shopping', 'Necklace', 'Mangalsutra', 'Bangles & earrings'],
  },
  { title: 'Book mehendi & bridal makeup artist', timeframe: '6-9 months' },
  { title: 'Decide wedding theme & color palette', timeframe: '6-9 months' },
  { title: 'Book decorator / mandap designer', timeframe: '6-9 months' },
  { title: 'Book live band / DJ / nadaswaram', timeframe: '6-9 months' },
  { title: 'Design & order wedding invitations', timeframe: '6-9 months' },
  { title: 'Book groom\'s attire (veshti, sherwani, etc.)', timeframe: '6-9 months' },

  { title: 'Send invitations', timeframe: '3-6 months' },
  { title: 'Arrange accommodation for outstation guests', timeframe: '3-6 months' },
  { title: 'Book transport for guests & families', timeframe: '3-6 months' },
  { title: 'Menu tasting with caterer', timeframe: '3-6 months' },
  { title: 'Plan sangeet / haldi / mehendi function', timeframe: '3-6 months' },
  { title: 'Order return gifts / wedding favors', timeframe: '3-6 months' },
  { title: 'Book makeup & hair trial', timeframe: '3-6 months' },
  { title: 'Arrange priest & ritual items (poojai saamagri)', timeframe: '3-6 months' },

  { title: 'Blouse stitching & fittings', timeframe: '1-2 months' },
  { title: 'Confirm decor & mandap setup', timeframe: '1-2 months' },
  { title: 'Confirm final headcount with caterer', timeframe: '1-2 months' },
  { title: 'Finalize seating arrangements', timeframe: '1-2 months' },
  { title: 'Confirm all vendor contracts & advance payments', timeframe: '1-2 months' },
  { title: 'Plan honeymoon / post-wedding trip', timeframe: '1-2 months' },
  { title: 'Apply for marriage certificate / legal paperwork', timeframe: '1-2 months' },

  { title: 'Pack for muhurtham & reception', timeframe: 'Week of' },
  { title: 'Hand over schedule to family/coordinators', timeframe: 'Week of' },
  { title: 'Confirm hair & makeup appointment times', timeframe: 'Week of' },
  { title: 'Rehearse rituals with priest', timeframe: 'Week of' },
  { title: 'Collect outfits, jewelry & accessories from vendors', timeframe: 'Week of' },

  { title: 'Carry jewelry, documents, return gifts', timeframe: 'Day of' },
  { title: 'Keep an emergency kit ready (pins, thread, stain remover)', timeframe: 'Day of' },
  { title: 'Assign a point-of-contact for each vendor', timeframe: 'Day of' },
]

export default function Tasks() {
  const { rows, insert, update, remove } = useTable<Task>('tasks')
  const [showForm, setShowForm] = useState(false)

  const topLevel = rows.filter((t) => !t.parent_id)
  const grouped = TIMEFRAMES.map((tf) => ({ tf, items: topLevel.filter((t) => t.timeframe === tf) })).filter(
    (g) => g.items.length > 0,
  )
  const untimed = topLevel.filter((t) => !t.timeframe)
  const done = topLevel.filter((t) => isTaskDone(t, rows)).length

  async function seedStarterTasks() {
    for (const t of STARTER_TASKS) {
      let parent = topLevel.find((r) => r.title.trim().toLowerCase() === t.title.trim().toLowerCase())
      if (!parent) {
        parent = (await insert({ title: t.title, timeframe: t.timeframe, done: false })) ?? undefined
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
        title="Checklist"
        subtitle={`${done} of ${topLevel.length} done`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={seedStarterTasks}>Load wedding checklist</Button>
            <Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ Add task'}</Button>
          </div>
        }
      />

      {showForm && (
        <Card className="mb-4">
          <TaskForm
            onSave={(values) => {
              insert(values)
              setShowForm(false)
            }}
          />
        </Card>
      )}

      {rows.length === 0 && <EmptyState text="No tasks yet — add your own or load the wedding checklist." />}

      <div className="space-y-5">
        {grouped.map(({ tf, items }) => (
          <div key={tf}>
            <h2 className="mb-2 text-sm font-semibold text-stone-500">{tf}</h2>
            <div className="space-y-2">
              {items.map((t) => (
                <TaskRow key={t.id} task={t} allTasks={rows} onUpdate={update} onRemove={remove} onInsert={insert} />
              ))}
            </div>
          </div>
        ))}
        {untimed.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-semibold text-stone-500">Other</h2>
            <div className="space-y-2">
              {untimed.map((t) => (
                <TaskRow key={t.id} task={t} allTasks={rows} onUpdate={update} onRemove={remove} onInsert={insert} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function isTaskDone(task: Task, allTasks: Task[]): boolean {
  const children = allTasks.filter((t) => t.parent_id === task.id)
  if (children.length === 0) return task.done
  return children.every((c) => c.done)
}

function TaskRow({
  task,
  allTasks,
  onUpdate,
  onRemove,
  onInsert,
}: {
  task: Task
  allTasks: Task[]
  onUpdate: (id: string, v: Partial<Task>) => void
  onRemove: (id: string) => void
  onInsert: (v: Partial<Task>) => Promise<Task | null>
}) {
  const [editing, setEditing] = useState(false)
  const [editingOwner, setEditingOwner] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [addingSubtask, setAddingSubtask] = useState(false)
  const [subtaskTitle, setSubtaskTitle] = useState('')

  const children = allTasks.filter((t) => t.parent_id === task.id)
  const hasSubtasks = children.length > 0
  const doneCount = children.filter((c) => c.done).length
  const pct = hasSubtasks ? (doneCount / children.length) * 100 : 0
  const complete = hasSubtasks ? pct === 100 : task.done

  if (editing) {
    return (
      <Card className="py-3">
        <TaskForm
          initial={task}
          onSave={(values) => {
            onUpdate(task.id, values)
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
              checked={task.done}
              onChange={(e) => onUpdate(task.id, { done: e.target.checked })}
              className="size-4"
            />
          )}
          {hasSubtasks && (
            <button onClick={() => setExpanded((e) => !e)} className="text-stone-400">
              {expanded ? '▾' : '▸'}
            </button>
          )}
          <span className={complete ? 'text-stone-400 line-through' : 'text-stone-800'}>
            {task.title} {complete && hasSubtasks && '🎉'}
          </span>
        </div>

        {editingOwner ? (
          <OwnerPicker
            value={task.owner}
            onChange={(owner) => {
              onUpdate(task.id, { owner })
              setEditingOwner(false)
            }}
            onClose={() => setEditingOwner(false)}
          />
        ) : (
          <button
            onClick={() => setEditingOwner(true)}
            className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
              task.owner ? OWNER_STYLES : 'bg-stone-100 text-stone-400'
            }`}
          >
            {task.owner || '+ Owner'}
          </button>
        )}

        <Button variant="secondary" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <Button variant="danger" onClick={() => onRemove(task.id)}>
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
                  onInsert({ title: subtaskTitle.trim(), parent_id: task.id, done: false })
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
  subtask: Task
  onUpdate: (id: string, v: Partial<Task>) => void
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

function TaskForm({ initial, onSave }: { initial?: Task; onSave: (v: Partial<Task>) => void }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [timeframe, setTimeframe] = useState(initial?.timeframe ?? TIMEFRAMES[0])
  const initialOwner = initial?.owner ?? ''
  const [owner, setOwner] = useState(initialOwner && !OWNER_PRESETS.includes(initialOwner) ? 'Other' : initialOwner)
  const [customOwner, setCustomOwner] = useState(initialOwner && !OWNER_PRESETS.includes(initialOwner) ? initialOwner : '')

  return (
    <form
      className="grid gap-3 md:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault()
        const finalOwner = owner === 'Other' ? customOwner.trim() : owner
        onSave({ title, timeframe, owner: finalOwner || null, done: initial?.done ?? false })
      }}
    >
      <label className="text-sm text-stone-500 md:col-span-2">
        Task
        <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label className="text-sm text-stone-500">
        Timeframe
        <Select className="mt-1" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
          {TIMEFRAMES.map((tf) => (
            <option key={tf}>{tf}</option>
          ))}
        </Select>
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
        Save task
      </Button>
    </form>
  )
}
