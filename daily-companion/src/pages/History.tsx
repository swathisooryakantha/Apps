import { format } from 'date-fns'
import { useTable } from '../hooks/useTable'
import type { DailyEntry, RoutineCompletion } from '../lib/types'
import { MOOD_OPTIONS, PERSONALITY_INFO } from '../lib/voices'
import { moonPhase } from '../lib/moon'
import { Card, EmptyState } from '../components/ui'

export default function History() {
  const { rows: entries } = useTable<DailyEntry>('daily_entries', { column: 'entry_date', ascending: false })
  const { rows: completions } = useTable<RoutineCompletion>('routine_completions')

  const done = entries.filter((e) => e.completed)

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--paper)]">That happened.</h1>
      <p className="mt-1 text-sm text-white/50">A calm log of finished days — not a dashboard, nothing to optimize.</p>

      {done.length === 0 && <div className="mt-6"><EmptyState text="Nothing logged yet. Finish today's page and it'll show up here." /></div>}

      <div className="mt-5 space-y-3">
        {done.map((entry) => {
          const info = PERSONALITY_INFO[entry.personality]
          const mood = MOOD_OPTIONS.find((m) => m.mood === entry.mood)
          const moon = moonPhase(entry.entry_date)
          const total = completions.filter((c) => c.daily_entry_id === entry.id).length
          const doneCount = completions.filter((c) => c.daily_entry_id === entry.id && c.done).length
          return (
            <Card key={entry.id} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/30">
                  Day {entry.day_number} · {format(new Date(`${entry.entry_date}T12:00:00`), 'EEE, MMM d, yyyy')}
                </p>
                <p className="mt-1 text-sm text-[var(--paper)]">
                  {info.emoji} {info.name} · <span className="capitalize">{entry.mode}</span> mode
                </p>
                <p className="mt-1 text-xs text-white/40">
                  {mood ? `${mood.emoji} ${mood.label}` : 'Skipped check-in'}
                  {total > 0 && ` · ${doneCount}/${total} routines`}
                  {entry.grounding_done && ' · grounded'}
                </p>
              </div>
              <span className="text-xl" title={moon.name}>
                {moon.symbol}
              </span>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
