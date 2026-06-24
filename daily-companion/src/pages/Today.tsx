import { useState } from 'react'
import { format } from 'date-fns'
import { useAppSettings } from '../hooks/useAppSettings'
import { useTable } from '../hooks/useTable'
import type { ChallengeLength, DailyEntry, Mode, Mood, Routine, RoutineCompletion } from '../lib/types'
import {
  DEFAULT_PERSONALITY,
  MOOD_OPTIONS,
  MOOD_TO_PERSONALITY,
  PERSONALITY_INFO,
  getCompleteLine,
  getCuriosityIntro,
  getCuriosityMore,
  getGreeting,
  getGroundingDone,
  getGroundingIntro,
  getMilestoneLine,
  getModeLine,
  getRoutineHype,
  getRoutineIntro,
} from '../lib/voices'
import { groundingExerciseForIndex } from '../lib/grounding'
import { MAX_CURIOSITY_TURNS, curiosityForIndex } from '../lib/curiosity'
import { moonPhase } from '../lib/moon'
import { Button, Card, EmptyState, Input, ProgressBar, VoiceLine } from '../components/ui'

function todayStr() {
  return format(new Date(), 'yyyy-MM-dd')
}

export default function Today() {
  const { settings, loading: settingsLoading, start } = useAppSettings()
  const { rows: entries, insert: insertEntry, update: updateEntry } = useTable<DailyEntry>('daily_entries', {
    column: 'entry_date',
    ascending: false,
  })
  const { rows: routines, insert: insertRoutine } = useTable<Routine>('routines', { column: 'sort_order', ascending: true })
  const { rows: completions, insert: insertCompletion, update: updateCompletion } = useTable<RoutineCompletion>('routine_completions')

  if (settingsLoading) return null
  if (!settings) return <ChallengeSetup onStart={start} />

  const date = todayStr()
  const entry = entries.find((e) => e.entry_date === date) ?? null
  const completedCount = entries.filter((e) => e.completed).length
  const seed = entry?.day_number ?? completedCount + 1

  return (
    <div className="space-y-6">
      <ArcHeader challengeLength={settings.challenge_length} completedCount={completedCount} date={date} />

      {!entry && (
        <MoodStep
          onPick={async (mood) => {
            const personality = mood ? MOOD_TO_PERSONALITY[mood] : DEFAULT_PERSONALITY
            await insertEntry({ entry_date: date, mood, personality, current_step: 'mode' } as Partial<DailyEntry>)
          }}
        />
      )}

      {entry && entry.current_step === 'mode' && (
        <ModeStep
          entry={entry}
          seed={seed}
          onPick={(mode) => updateEntry(entry.id, { mode, current_step: 'routines' })}
        />
      )}

      {entry && entry.current_step === 'routines' && entry.mode && (
        <RoutinesStep
          entry={entry}
          mode={entry.mode}
          seed={seed}
          routines={routines}
          completions={completions.filter((c) => c.daily_entry_id === entry.id)}
          onAddRoutine={(name) => insertRoutine({ name, sort_order: routines.length } as Partial<Routine>)}
          onToggle={(routineId, existing) => {
            if (existing) updateCompletion(existing.id, { done: !existing.done })
            else insertCompletion({ daily_entry_id: entry.id, routine_id: routineId, done: true } as Partial<RoutineCompletion>)
          }}
          onContinue={() => updateEntry(entry.id, { current_step: 'grounding' })}
        />
      )}

      {entry && entry.current_step === 'grounding' && (
        <GroundingStep
          entry={entry}
          seed={seed}
          onDone={(exerciseId) =>
            updateEntry(entry.id, { grounding_done: true, grounding_exercise_id: exerciseId, current_step: 'curiosity' })
          }
          onSkip={(exerciseId) => updateEntry(entry.id, { grounding_exercise_id: exerciseId, current_step: 'curiosity' })}
        />
      )}

      {entry && entry.current_step === 'curiosity' && (
        <CuriosityStep
          entry={entry}
          seed={seed}
          onTurnPage={() => updateEntry(entry.id, { curiosity_viewed_count: entry.curiosity_viewed_count + 1 })}
          onFinish={(curiosityId) => {
            const dayNumber = completedCount + 1
            updateEntry(entry.id, { curiosity_id: curiosityId, completed: true, current_step: 'done', day_number: dayNumber })
          }}
        />
      )}

      {entry && entry.current_step === 'done' && (
        <DoneRecap entry={entry} challengeLength={settings.challenge_length} routines={routines} completions={completions.filter((c) => c.daily_entry_id === entry.id)} />
      )}
    </div>
  )
}

function ArcHeader({ challengeLength, completedCount, date }: { challengeLength: ChallengeLength; completedCount: number; date: string }) {
  const pct = (completedCount / challengeLength) * 100
  const markers = challengeLength === 75 ? [(30 / 75) * 100] : []
  const moon = moonPhase(date)
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-xs text-white/50">
        <span>
          Day {Math.min(completedCount + 1, challengeLength)} of {challengeLength}
        </span>
        <span title={moon.name}>{moon.symbol} {format(new Date(`${date}T12:00:00`), 'EEEE, MMM d')}</span>
      </div>
      <ProgressBar value={pct} markers={markers} />
    </div>
  )
}

function ChallengeSetup({ onStart }: { onStart: (length: 30 | 75) => void }) {
  return (
    <Card>
      <h1 className="font-display text-2xl text-[var(--paper)]">Pick your arc.</h1>
      <p className="mt-2 text-sm text-white/60">
        One continuous counter. A missed day just doesn't advance it — there's no reset, no punishment. Day 30 is a checkpoint
        inside the 75, not a separate track.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => onStart(30)}
          className="rounded-2xl border border-white/15 bg-white/5 p-5 text-left transition hover:bg-white/10"
        >
          <div className="font-display text-xl text-[var(--paper)]">30 days</div>
          <p className="mt-1 text-xs text-white/50">A shorter arc.</p>
        </button>
        <button
          onClick={() => onStart(75)}
          className="rounded-2xl border border-white/15 bg-white/5 p-5 text-left transition hover:bg-white/10"
        >
          <div className="font-display text-xl text-[var(--paper)]">75 days</div>
          <p className="mt-1 text-xs text-white/50">Day 30 is a checkpoint inside it.</p>
        </button>
      </div>
    </Card>
  )
}

function MoodStep({ onPick }: { onPick: (mood: Mood | null) => void }) {
  return (
    <Card>
      <h2 className="font-display text-xl text-[var(--paper)]">How are you, right now?</h2>
      <p className="mt-1 text-sm text-white/50">This sets today's voice. Skip it and you get the default.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {MOOD_OPTIONS.map((m) => (
          <button
            key={m.mood}
            onClick={() => onPick(m.mood)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left text-sm transition hover:bg-white/10"
          >
            <span className="mr-1.5">{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>
      <Button variant="ghost" className="mt-3" onClick={() => onPick(null)}>
        Skip check-in for today →
      </Button>
    </Card>
  )
}

function ModeStep({ entry, seed, onPick }: { entry: DailyEntry; seed: number; onPick: (mode: Mode) => void }) {
  const info = PERSONALITY_INFO[entry.personality]
  return (
    <Card>
      <VoiceLine emoji={info.emoji}>{getGreeting(entry.personality, seed)}</VoiceLine>
      <p className="mt-1 text-xs uppercase tracking-wide text-white/30">{info.name}</p>
      <h2 className="mt-4 font-display text-xl text-[var(--paper)]">Hard or soft today?</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button onClick={() => onPick('hard')} className="rounded-2xl border border-white/15 bg-white/5 p-4 text-left transition hover:bg-white/10">
          <div className="font-medium text-[var(--paper)]">Hard mode</div>
          <p className="mt-1 text-xs text-white/50">{getModeLine(entry.personality, 'hard', seed)}</p>
        </button>
        <button onClick={() => onPick('soft')} className="rounded-2xl border border-white/15 bg-white/5 p-4 text-left transition hover:bg-white/10">
          <div className="font-medium text-[var(--paper)]">Soft mode</div>
          <p className="mt-1 text-xs text-white/50">{getModeLine(entry.personality, 'soft', seed)}</p>
        </button>
      </div>
    </Card>
  )
}

function RoutinesStep({
  entry,
  mode,
  seed,
  routines,
  completions,
  onAddRoutine,
  onToggle,
  onContinue,
}: {
  entry: DailyEntry
  mode: Mode
  seed: number
  routines: Routine[]
  completions: RoutineCompletion[]
  onAddRoutine: (name: string) => void
  onToggle: (routineId: string, existing: RoutineCompletion | undefined) => void
  onContinue: () => void
}) {
  const [draft, setDraft] = useState('')
  const doneCount = completions.filter((c) => c.done).length

  return (
    <Card>
      <VoiceLine>{getRoutineIntro(entry.personality, seed)}</VoiceLine>

      {routines.length === 0 ? (
        <EmptyState text="No routines yet — add the few things you want today's voice to track." />
      ) : (
        <div className="mt-4 space-y-2">
          {routines.map((r) => {
            const existing = completions.find((c) => c.routine_id === r.id)
            return (
              <label key={r.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
                <input type="checkbox" checked={existing?.done ?? false} onChange={() => onToggle(r.id, existing)} className="size-4 accent-[var(--accent)]" />
                <span className={existing?.done ? 'text-white/40 line-through' : 'text-[var(--paper)]'}>{r.name}</span>
              </label>
            )
          })}
        </div>
      )}

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.trim()) return
          onAddRoutine(draft.trim())
          setDraft('')
        }}
      >
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a routine (e.g. take meds)" />
        <Button type="submit" variant="secondary">
          Add
        </Button>
      </form>

      {routines.length > 0 && (
        <p className="mt-4 text-sm text-white/70">{getRoutineHype(entry.personality, mode, doneCount, routines.length, seed)}</p>
      )}

      <Button className="mt-4 w-full" onClick={onContinue}>
        Continue
      </Button>
    </Card>
  )
}

function GroundingStep({
  entry,
  seed,
  onDone,
  onSkip,
}: {
  entry: DailyEntry
  seed: number
  onDone: (exerciseId: string) => void
  onSkip: (exerciseId: string) => void
}) {
  const exercise = groundingExerciseForIndex(seed - 1)
  return (
    <Card>
      <VoiceLine>{getGroundingIntro(entry.personality, seed)}</VoiceLine>
      <h2 className="mt-3 font-display text-lg text-[var(--paper)]">{exercise.title}</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-white/70">
        {exercise.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      <div className="mt-4 flex gap-2">
        <Button onClick={() => onDone(exercise.id)}>{getGroundingDone(entry.personality, seed)}</Button>
        <Button variant="ghost" onClick={() => onSkip(exercise.id)}>
          Skip for today
        </Button>
      </div>
    </Card>
  )
}

function CuriosityStep({
  entry,
  seed,
  onTurnPage,
  onFinish,
}: {
  entry: DailyEntry
  seed: number
  onTurnPage: () => void
  onFinish: (curiosityId: string) => void
}) {
  const factIndex = seed - 1 + entry.curiosity_viewed_count
  const fact = curiosityForIndex(factIndex)
  const canTurnPage = entry.curiosity_viewed_count < MAX_CURIOSITY_TURNS

  return (
    <Card>
      <VoiceLine>{getCuriosityIntro(entry.personality, seed)}</VoiceLine>
      <p className="mt-3 font-display text-lg leading-snug text-[var(--paper)]">{fact.text}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {canTurnPage && (
          <Button variant="secondary" onClick={onTurnPage}>
            {getCuriosityMore(entry.personality, seed)}
          </Button>
        )}
        <Button onClick={() => onFinish(fact.id)}>Finish the day</Button>
      </div>
    </Card>
  )
}

function DoneRecap({
  entry,
  challengeLength,
  routines,
  completions,
}: {
  entry: DailyEntry
  challengeLength: ChallengeLength
  routines: Routine[]
  completions: RoutineCompletion[]
}) {
  const info = PERSONALITY_INFO[entry.personality]
  const mood = MOOD_OPTIONS.find((m) => m.mood === entry.mood)
  const doneCount = completions.filter((c) => c.done).length
  const isMilestone = entry.day_number === 30 || entry.day_number === challengeLength
  const seed = entry.day_number ?? 1

  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-white/30">
        Day {entry.day_number} · {info.name} {info.emoji}
      </p>
      <VoiceLine>{entry.mode ? getCompleteLine(entry.personality, entry.mode, seed) : ''}</VoiceLine>

      {isMilestone && <p className="mt-2 text-sm text-[var(--accent)]">{getMilestoneLine(entry.personality, seed)}</p>}

      <dl className="mt-4 space-y-1.5 text-sm text-white/60">
        <div className="flex justify-between">
          <dt>Mood</dt>
          <dd>{mood ? `${mood.emoji} ${mood.label}` : 'Skipped check-in'}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Mode</dt>
          <dd className="capitalize">{entry.mode}</dd>
        </div>
        {routines.length > 0 && (
          <div className="flex justify-between">
            <dt>Routines</dt>
            <dd>
              {doneCount} of {routines.length}
            </dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt>Grounding</dt>
          <dd>{entry.grounding_done ? 'Done' : 'Skipped'}</dd>
        </div>
      </dl>

      <p className="mt-4 text-sm text-white/40">That happened today. Come back tomorrow — there's nothing else here for now.</p>
    </Card>
  )
}
